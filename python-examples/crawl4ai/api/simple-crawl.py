"""
Crawls a single URL and returns the page content as clean markdown.

Based on: https://docs.crawl4ai.com/core/simple-crawling/
"""

from playwright.async_api import Page, BrowserContext
from typing import TypedDict
from crawl4ai import AsyncWebCrawler
from crawl4ai.async_configs import BrowserConfig, CrawlerRunConfig, CacheMode


class Params(TypedDict):
    url: str


async def automation(
    page: Page,
    params: Params,
    context: BrowserContext | None = None,
    **_kwargs,
):
    url = params.get("url")
    if not url:
        return {
            "success": False,
            "error": "URL parameter is required",
        }

    browser_config = BrowserConfig(verbose=True)
    run_config = CrawlerRunConfig(
        # Content filtering
        word_count_threshold=10,
        excluded_tags=["form", "header"],
        exclude_external_links=True,
        # Content processing
        process_iframes=True,
        remove_overlay_elements=True,
        # Cache control
        cache_mode=CacheMode.ENABLED,  # Use cache if available
    )

    async with AsyncWebCrawler(config=browser_config) as crawler:
        result = await crawler.arun(
            url=url,
            config=run_config,
        )

        if result.success:
            return {
                "success": True,
                "markdown": result.markdown,
                "images": result.media["images"],
                "links": result.links["internal"],
            }
        else:
            return {
                "success": False,
                "error": result.error_message,
            }
