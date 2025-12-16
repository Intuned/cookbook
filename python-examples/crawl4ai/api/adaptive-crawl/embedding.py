"""
Adaptive crawling with embedding strategy (semantic understanding).

Requires an API key for LLM-based query expansion.

Based on: https://docs.crawl4ai.com/core/adaptive-crawling/
"""

import os
from playwright.async_api import Page, BrowserContext
from typing import TypedDict
from crawl4ai import AsyncWebCrawler, AdaptiveCrawler, AdaptiveConfig


class Params(TypedDict, total=False):
    url: str
    query: str
    api_key: str
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

    api_key = params.get("api_key")
    if not api_key:
        return {
            "success": False,
            "error": "OpenAI api_key parameter is required for embedding strategy",
        }

    os.environ["OPENAI_API_KEY"] = api_key

    max_pages = params.get("max_pages", 20)
    top_k = params.get("top_k", 5)

    config = AdaptiveConfig(
        strategy="embedding",
        embedding_model="sentence-transformers/all-MiniLM-L6-v2",
        n_query_variations=10,
        embedding_min_confidence_threshold=0.1,
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
