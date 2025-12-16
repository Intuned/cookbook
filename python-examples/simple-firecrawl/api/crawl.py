"""
Crawl a website and all its accessible subpages.

Firecrawl-compatible /crawl endpoint using crawl4ai.
"""

from playwright.async_api import Page, BrowserContext
from typing import TypedDict
from crawl4ai import AsyncWebCrawler
from crawl4ai.async_configs import BrowserConfig, CrawlerRunConfig
from crawl4ai.deep_crawling import BFSDeepCrawlStrategy
from crawl4ai.deep_crawling.filters import FilterChain, ContentTypeFilter


class Params(TypedDict, total=False):
    url: str
    limit: int


async def automation(
    page: Page,
    params: Params,
    context: BrowserContext | None = None,
    **_kwargs,
):
    url = params.get("url")
    if not url:
        return {"success": False, "error": "url parameter is required"}

    limit = params.get("limit", 10)

    strategy = BFSDeepCrawlStrategy(
        max_depth=2,
        max_pages=limit,
        include_external=False,
        filter_chain=FilterChain([ContentTypeFilter(allowed_types=["text/html"])]),
    )

    browser_config = BrowserConfig(verbose=True)
    run_config = CrawlerRunConfig(
        deep_crawl_strategy=strategy,
        stream=True,
        verbose=True,
    )

    data = []

    async with AsyncWebCrawler(config=browser_config) as crawler:
        async for result in await crawler.arun(url=url, config=run_config):
            if result.success:
                meta = result.metadata or {}
                data.append(
                    {
                        "markdown": result.markdown,
                        "html": result.cleaned_html,
                        "metadata": {
                            "title": meta.get("title", ""),
                            "description": meta.get("description", ""),
                            "language": meta.get("language", ""),
                            "sourceURL": result.url,
                            "statusCode": 200,
                        },
                    }
                )

    return {
        "success": True,
        "status": "completed",
        "total": len(data),
        "completed": len(data),
        "data": data,
    }
