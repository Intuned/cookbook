"""
Adaptive crawling with statistical strategy (term-based analysis).

Based on: https://docs.crawl4ai.com/core/adaptive-crawling/
"""

from typing import TypedDict

from playwright.async_api import BrowserContext, Page

from crawl4ai import AdaptiveConfig, AdaptiveCrawler, AsyncWebCrawler


class Params(TypedDict, total=False):
    url: str
    query: str
    max_pages: int
    top_k: int


async def automation(
    page: Page,
    params: Params,
    context: BrowserContext | None = None,
    **_kwargs,
):
    url = params.get("url")
    if not url:
        return {"success": False, "error": "url parameter is required"}

    query = params.get("query")
    if not query:
        return {"success": False, "error": "query parameter is required"}

    max_pages = params.get("max_pages", 20)
    top_k = params.get("top_k", 5)

    config = AdaptiveConfig(
        strategy="statistical",
        confidence_threshold=0.8,
        max_pages=max_pages,
        top_k_links=3,
    )

    async with AsyncWebCrawler() as crawler:
        adaptive = AdaptiveCrawler(crawler, config=config)

        await adaptive.digest(
            start_url=url,
            query=query,
        )

        relevant_pages = adaptive.get_relevant_content(top_k=top_k)

        return {
            "success": True,
            "query": query,
            "total_pages": len(relevant_pages),
            "pages": [
                {
                    "url": page["url"],
                    "score": page["score"],
                    "content": page["content"],
                }
                for page in relevant_pages
            ],
        }
