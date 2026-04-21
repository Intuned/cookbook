"""
Minimal crawl4ai starter: crawl a URL and return markdown.

Based on: https://docs.crawl4ai.com/core/simple-crawling/
"""

from typing import TypedDict

from playwright.async_api import BrowserContext, Page

from crawl4ai import AsyncWebCrawler
from crawl4ai.async_configs import CacheMode, CrawlerRunConfig


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
        return {"success": False, "error": "url parameter is required"}

    run_config = CrawlerRunConfig(cache_mode=CacheMode.BYPASS, verbose=False)

    async with AsyncWebCrawler() as crawler:
        result = await crawler.arun(url=url, config=run_config)
        if not result.success:
            return {"success": False, "error": result.error_message}
        return {
            "success": True,
            "url": url,
            "markdown": result.markdown,
        }
