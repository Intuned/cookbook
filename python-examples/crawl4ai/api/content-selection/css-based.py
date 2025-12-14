"""
Extract structured data from a webpage using CSS selectors.

Uses JsonCssExtractionStrategy with content filtering and iframe processing.

Based on: https://docs.crawl4ai.com/core/content-selection/
"""

import json
from playwright.async_api import Page, BrowserContext
from typing import TypedDict, Any
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, CacheMode
from crawl4ai import JsonCssExtractionStrategy


class Params(TypedDict, total=False):
    url: str
    schema: dict[str, Any]
    css_selector: str
    process_iframes: bool
    excluded_tags: list[str]
    exclude_external_links: bool
    exclude_external_images: bool
    exclude_domains: list[str]


EXAMPLE_SCHEMA = {
    "name": "ArticleBlock",
    "baseSelector": "div.article-block",
    "fields": [
        {"name": "headline", "selector": "h2", "type": "text"},
        {"name": "summary", "selector": ".summary", "type": "text"},
        {
            "name": "metadata",
            "type": "nested",
            "fields": [
                {"name": "author", "selector": ".author", "type": "text"},
                {"name": "date", "selector": ".date", "type": "text"},
            ],
        },
    ],
}


async def automation(
    page: Page,
    params: Params | None = None,
    context: BrowserContext | None = None,
    **_kwargs,
):
    url = params.get("url")
    if not url:
        return {"success": False, "error": "url parameter is required"}

    schema = params.get("schema", EXAMPLE_SCHEMA)
    css_selector = params.get("css_selector")
    process_iframes = params.get("process_iframes", True)
    excluded_tags = params.get("excluded_tags", ["nav", "footer"])
    exclude_external_links = params.get("exclude_external_links", True)
    exclude_external_images = params.get("exclude_external_images", True)
    exclude_domains = params.get("exclude_domains", [])

    config = CrawlerRunConfig(
        # Content scoping
        css_selector=css_selector,
        # Iframe handling
        process_iframes=process_iframes,
        remove_overlay_elements=True,
        # Filtering
        word_count_threshold=10,
        excluded_tags=excluded_tags,
        exclude_external_links=exclude_external_links,
        exclude_external_images=exclude_external_images,
        exclude_domains=exclude_domains,
        # Extraction
        extraction_strategy=JsonCssExtractionStrategy(schema),
        cache_mode=CacheMode.BYPASS,
        verbose=True,
    )

    async with AsyncWebCrawler() as crawler:
        result = await crawler.arun(
            url=url,
            config=config,
        )

        if not result.success:
            return {
                "success": False,
                "error": result.error_message,
            }

        data = json.loads(result.extracted_content) if result.extracted_content else []

        return {
            "success": True,
            "url": result.url,
            "total_items": len(data),
            "data": data,
        }
