"""
Crawl multiple URLs concurrently with dispatchers for rate limiting and memory management.

Uses arun_many() with MemoryAdaptiveDispatcher for efficient batch crawling.

Based on: https://docs.crawl4ai.com/advanced/multi-url-crawling/
"""

from playwright.async_api import Page, BrowserContext
from typing import TypedDict, Literal
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, CacheMode
from crawl4ai.async_configs import BrowserConfig
from crawl4ai.async_dispatcher import (
    MemoryAdaptiveDispatcher,
    SemaphoreDispatcher,
    RateLimiter,
)
from crawl4ai import CrawlerMonitor, DisplayMode


class Params(TypedDict, total=False):
    urls: list[str]
    dispatcher: Literal["memory-adaptive", "semaphore"]
    max_concurrent: int
    stream: bool
    monitor: bool


async def automation(
    page: Page,
    params: Params | None = None,
    context: BrowserContext | None = None,
    **_kwargs,
):
    urls = params.get("urls")
    if not urls or len(urls) == 0:
        return {"success": False, "error": "urls parameter is required (list of URLs)"}

    dispatcher_type = params.get("dispatcher", "memory-adaptive")
    max_concurrent = params.get("max_concurrent", 5)
    stream = params.get("stream", True)

    rate_limiter = RateLimiter(
        base_delay=(0.5, 1.0),
        max_delay=30.0,
        max_retries=2,
    )

    monitor = None
    if params.get("monitor", False):
        monitor = CrawlerMonitor(
            max_visible_rows=15,
            display_mode=DisplayMode.DETAILED,
        )

    if dispatcher_type == "semaphore":
        dispatcher = SemaphoreDispatcher(
            max_session_permit=max_concurrent,
            rate_limiter=rate_limiter,
            monitor=monitor,
        )
    else:
        dispatcher = MemoryAdaptiveDispatcher(
            memory_threshold_percent=70.0,
            check_interval=1.0,
            max_session_permit=max_concurrent,
            rate_limiter=rate_limiter,
            monitor=monitor,
        )

    browser_config = BrowserConfig(headless=True, verbose=True)
    run_config = CrawlerRunConfig(
        cache_mode=CacheMode.BYPASS,
        stream=stream,
        verbose=True,
    )

    crawled_pages = []
    failed_pages = []

    async with AsyncWebCrawler(config=browser_config) as crawler:
        if stream:
            async for result in await crawler.arun_many(
                urls=urls,
                config=run_config,
                dispatcher=dispatcher,
            ):
                if result.success:
                    crawled_pages.append(
                        {"url": result.url, "markdown": result.markdown}
                    )
                else:
                    failed_pages.append(
                        {"url": result.url, "error": result.error_message}
                    )
        else:
            results = await crawler.arun_many(
                urls=urls,
                config=run_config,
                dispatcher=dispatcher,
            )
            for result in results:
                if result.success:
                    crawled_pages.append(
                        {"url": result.url, "markdown": result.markdown}
                    )
                else:
                    failed_pages.append(
                        {"url": result.url, "error": result.error_message}
                    )

    return {
        "success": True,
        "total_urls": len(urls),
        "succeeded": len(crawled_pages),
        "failed": len(failed_pages),
        "dispatcher": dispatcher_type,
        "pages": crawled_pages,
        "errors": failed_pages,
    }
