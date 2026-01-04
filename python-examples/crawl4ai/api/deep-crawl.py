"""
Deep crawl a website, following links across multiple pages.

Supports BFS, DFS, and Best-First crawling strategies with filtering and scoring.

Based on: https://docs.crawl4ai.com/core/deep-crawling/
"""

from typing import Literal, TypedDict

from playwright.async_api import BrowserContext, Page

from crawl4ai import AsyncWebCrawler, CrawlerRunConfig
from crawl4ai.async_configs import BrowserConfig
from crawl4ai.content_scraping_strategy import LXMLWebScrapingStrategy
from crawl4ai.deep_crawling import (
    BestFirstCrawlingStrategy,
    BFSDeepCrawlStrategy,
    DFSDeepCrawlStrategy,
)
from crawl4ai.deep_crawling.filters import (
    ContentTypeFilter,
    DomainFilter,
    FilterChain,
    URLPatternFilter,
)
from crawl4ai.deep_crawling.scorers import KeywordRelevanceScorer


class Params(TypedDict, total=False):
    url: str
    strategy: Literal["bfs", "dfs", "best-first"]
    max_depth: int
    max_pages: int
    include_external: bool
    keywords: list[str]  # For scoring
    allowed_domains: list[str]
    blocked_domains: list[str]
    url_patterns: list[str]


async def automation(
    page: Page,
    params: Params,
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

    # Create scorer if keywords provided
    url_scorer = (
        KeywordRelevanceScorer(keywords=keywords, weight=0.7) if keywords else None
    )

    # Create strategy
    if strategy_name == "bfs":
        strategy = BFSDeepCrawlStrategy(
            max_depth=max_depth,
            max_pages=max_pages,
            include_external=include_external,
            filter_chain=filter_chain,
            url_scorer=url_scorer,
        )
    elif strategy_name == "dfs":
        strategy = DFSDeepCrawlStrategy(
            max_depth=max_depth,
            max_pages=max_pages,
            include_external=include_external,
            filter_chain=filter_chain,
            url_scorer=url_scorer,
        )
    elif strategy_name == "best-first":
        strategy = BestFirstCrawlingStrategy(
            max_depth=max_depth,
            max_pages=max_pages,
            include_external=include_external,
            filter_chain=filter_chain,
            url_scorer=url_scorer,
        )

    browser_config = BrowserConfig(verbose=True)
    run_config = CrawlerRunConfig(
        deep_crawl_strategy=strategy,
        scraping_strategy=LXMLWebScrapingStrategy(),
        stream=True,
        verbose=True,
    )

    # Execute deep crawl with streaming
    pages = []
    async with AsyncWebCrawler(config=browser_config) as crawler:
        async for result in await crawler.arun(url=url, config=run_config):
            if result.success:
                score = result.metadata.get("score", 0)
                depth = result.metadata.get("depth", 0)
                pages.append(
                    {
                        "url": result.url,
                        "depth": depth,
                        "score": round(score, 2),
                        "markdown": result.markdown,
                    }
                )

    # Group by depth
    depth_counts = {}
    for p in pages:
        d = p["depth"]
        depth_counts[d] = depth_counts.get(d, 0) + 1

    # Calculate average score
    avg_score = sum(p["score"] for p in pages) / len(pages) if pages else 0

    return {
        "success": True,
        "total_pages": len(pages),
        "average_score": round(avg_score, 2),
        "pages_by_depth": depth_counts,
        "strategy": strategy_name,
        "pages": pages,
    }
