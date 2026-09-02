"""
Extract structured data from a webpage using CSS selectors.

Uses JsonCssExtractionStrategy with content filtering.

Based on: https://docs.crawl4ai.com/core/content-selection/
"""

import json
from typing import Any, TypedDict

from intuned_runtime import attempt_store
from playwright.async_api import BrowserContext, Page

from crawl4ai import (
    AsyncWebCrawler,
    CacheMode,
    CrawlerRunConfig,
    JsonCssExtractionStrategy,
)
from crawl4ai.async_configs import BrowserConfig


class Params(TypedDict, total=False):
    url: str
    schema: dict[str, Any]
    css_selector: str
    word_count_threshold: int
    excluded_tags: list[str]
    exclude_external_links: bool
    exclude_external_images: bool
    exclude_domains: list[str]


async def automation(
    page: Page,
    params: Params,
    context: BrowserContext | None = None,
    **_kwargs,
):
    url = params.get("url")
    if not url:
        return {"success": False, "error": "url parameter is required"}

    schema = params.get("schema")
    if not schema:
        return {"success": False, "error": "schema parameter is required"}

    config = CrawlerRunConfig(
        # CSS selection or entire page
        css_selector=params.get("css_selector"),
        # Filtering
        word_count_threshold=params.get("word_count_threshold", 10),
        excluded_tags=params.get("excluded_tags", ["nav", "footer"]),
        exclude_external_links=params.get("exclude_external_links", True),
        exclude_external_images=params.get("exclude_external_images", True),
        exclude_domains=params.get("exclude_domains", []),
        # Extraction strategy
        extraction_strategy=JsonCssExtractionStrategy(schema),
        # No caching
        cache_mode=CacheMode.BYPASS,
        verbose=True,
    )

    # Attach to Intuned's running browser instead of launching a new one
    browser_config = BrowserConfig(
        browser_mode="custom", cdp_url=attempt_store.get("cdp_url")
    )

    async with AsyncWebCrawler(config=browser_config) as crawler:
        result = await crawler.arun(url=url, config=config)

        if not result.success:
            return {"success": False, "error": result.error_message}

        data = json.loads(result.extracted_content) if result.extracted_content else []

        return {
            "success": True,
            "url": result.url,
            "total_items": len(data),
            "data": data,
        }
