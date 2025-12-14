"""
Deep crawl a website, following links across multiple pages.

Supports BFS, DFS, and Best-First crawling strategies with filtering and streaming.

Based on: https://docs.crawl4ai.com/core/deep-crawling/
"""

from playwright.async_api import Page, BrowserContext
from typing import TypedDict, Literal
from crawl4ai import AsyncWebCrawler
from crawl4ai.async_configs import BrowserConfig, CrawlerRunConfig
from crawl4ai.deep_crawling import (
    BFSDeepCrawlStrategy,
    DFSDeepCrawlStrategy,
    BestFirstCrawlingStrategy,
)
from crawl4ai.deep_crawling.filters import (
    FilterChain,
    DomainFilter,
    URLPatternFilter,
    ContentTypeFilter,
)
from crawl4ai.deep_crawling.scorers import KeywordRelevanceScorer


class Params(TypedDict, total=False):
    url: str
    strategy: Literal["bfs", "dfs", "best-first"]
    max_depth: int
    max_pages: int
    include_external: bool
    stream: bool
    keywords: list[str]  # For best-first strategy
    allowed_domains: list[str]
    blocked_domains: list[str]
    url_patterns: list[str]


async def automation(
    page: Page,
    params: Params | None = None,
    context: BrowserContext | None = None,
    **_kwargs,
):
    url = params.get("url")
    if not url:
        return {"success": False, "error": "url parameter is required"}

    strategy_name = params.get("strategy", "bfs")
    max_depth = params.get("max_depth", 2)
    max_pages = params.get("max_pages", 10)
    include_external = params.get("include_external", False)
    stream = params.get("stream", True)
    keywords = params.get("keywords", [])
    allowed_domains = params.get("allowed_domains", [])
    blocked_domains = params.get("blocked_domains", [])
    url_patterns = params.get("url_patterns", [])

    # Build filter chain
    filters = []
    if allowed_domains or blocked_domains:
        filters.append(
            DomainFilter(
                allowed_domains=allowed_domains if allowed_domains else None,
                blocked_domains=blocked_domains if blocked_domains else None,
            )
        )
    if url_patterns:
        filters.append(URLPatternFilter(patterns=url_patterns))
    filters.append(ContentTypeFilter(allowed_types=["text/html"]))
    filter_chain = FilterChain(filters)

    # Create strategy
    if strategy_name == "bfs":
        strategy = BFSDeepCrawlStrategy(
            max_depth=max_depth,
            max_pages=max_pages,
            include_external=include_external,
            filter_chain=filter_chain,
        )
    elif strategy_name == "dfs":
        strategy = DFSDeepCrawlStrategy(
            max_depth=max_depth,
            max_pages=max_pages,
            include_external=include_external,
            filter_chain=filter_chain,
        )
    elif strategy_name == "best-first":
        strategy = BestFirstCrawlingStrategy(
            max_depth=max_depth,
            max_pages=max_pages,
            include_external=include_external,
            filter_chain=filter_chain,
            url_scorer=KeywordRelevanceScorer(keywords=keywords, weight=0.7)
            if keywords
            else None,
        )

    browser_config = BrowserConfig(verbose=True)
    run_config = CrawlerRunConfig(
        deep_crawl_strategy=strategy,
        stream=stream,
        verbose=True,
    )

    crawled_pages = []

    async with AsyncWebCrawler(config=browser_config) as crawler:
        if stream:
            async for result in await crawler.arun(url=url, config=run_config):
                if result.success:
                    crawled_pages.append(
                        {
                            "url": result.url,
                            "depth": result.metadata.get("depth", 0),
                            "score": result.metadata.get("score", 0),
                            "markdown": result.markdown,
                        }
                    )
        else:
            results = await crawler.arun(url=url, config=run_config)
            if not isinstance(results, list):
                results = [results]
            for result in results:
                if result.success:
                    crawled_pages.append(
                        {
                            "url": result.url,
                            "depth": result.metadata.get("depth", 0),
                            "score": result.metadata.get("score", 0),
                            "markdown": result.markdown,
                        }
                    )

    return {
        "success": True,
        "total_pages": len(crawled_pages),
        "strategy": strategy_name,
        "pages": crawled_pages,
    }
