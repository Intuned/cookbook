"""
Extract all links from a webpage with title and description.

Similar to Firecrawl's /map endpoint but using crawl4ai.
"""

from playwright.async_api import Page, BrowserContext
from typing import TypedDict
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, CacheMode
from crawl4ai import LinkPreviewConfig


class Params(TypedDict, total=False):
    url: str
    limit: int  # how many links to fetch metadata for


async def automation(
    page: Page,
    params: Params | None = None,
    context: BrowserContext | None = None,
    **_kwargs,
):
    url = params.get("url")
    if not url:
        return {"success": False, "error": "url parameter is required"}

    limit = params.get("limit", 20)

    config = CrawlerRunConfig(
        link_preview_config=LinkPreviewConfig(
            include_internal=True,
            max_links=limit,
        ),
        cache_mode=CacheMode.BYPASS,
        verbose=True,
    )

    async with AsyncWebCrawler() as crawler:
        result = await crawler.arun(url=url, config=config)

        if not result.success:
            return {"success": False, "error": result.error_message}

        links = []
        for link in result.links.get("internal", [])[:limit]:
            head = link.get("head_data") or {}
            links.append(
                {
                    "url": link["href"],
                    "title": head.get("title"),
                    "description": (head.get("meta") or {}).get("description", ""),
                }
            )

        return {
            "success": True,
            "url": result.url,
            "total_links": len(links),
            "links": links,
        }
