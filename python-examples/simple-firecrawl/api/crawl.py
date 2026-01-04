"""
Crawl a website and all its accessible subpages.

Firecrawl-compatible /crawl endpoint using crawl4ai.
https://docs.firecrawl.dev/api-reference/endpoint/crawl-post
"""

import re
from typing import Any, Literal, TypedDict
from urllib.parse import urlparse

from playwright.async_api import BrowserContext, Page
from utils import (
    FormatType,
    LocationParams,
    build_response_item,
    create_browser_config,
    fetch_sitemap_urls,
    get_excluded_tags,
    get_locale_settings,
    is_child_path,
    is_same_domain,
    normalize_url,
)

from crawl4ai import AsyncWebCrawler, CacheMode, CrawlerRunConfig
from crawl4ai.deep_crawling import BFSDeepCrawlStrategy
from crawl4ai.deep_crawling.filters import (
    ContentTypeFilter,
    FilterChain,
    URLPatternFilter,
)


class ScrapeOptions(TypedDict, total=False):
    formats: list[FormatType]
    onlyMainContent: bool
    includeTags: list[str]
    excludeTags: list[str]
    waitFor: int
    mobile: bool
    timeout: int
    headers: dict[str, str]
    removeBase64Images: bool
    location: LocationParams


class Params(TypedDict, total=False):
    url: str
    limit: int
    maxDiscoveryDepth: int
    excludePaths: list[str]
    includePaths: list[str]
    sitemap: Literal["include", "skip"]
    ignoreQueryParameters: bool
    crawlEntireDomain: bool
    allowExternalLinks: bool
    allowSubdomains: bool
    delay: int  # milliseconds
    scrapeOptions: ScrapeOptions
    maxConcurrency: int


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
    max_depth = params.get("maxDiscoveryDepth", 2)
    exclude_paths = params.get("excludePaths", [])
    include_paths = params.get("includePaths", [])
    sitemap_mode = params.get("sitemap", "include")
    ignore_query = params.get("ignoreQueryParameters", False)
    crawl_entire_domain = params.get("crawlEntireDomain", False)
    allow_external = params.get("allowExternalLinks", False)
    allow_subdomains = params.get("allowSubdomains", False)
    delay_ms = params.get("delay", 0)
    max_concurrency = params.get("maxConcurrency", 5)
    scrape_options = params.get("scrapeOptions", {})

    # Build scrape config from options
    formats = scrape_options.get("formats", ["markdown"])
    only_main_content = scrape_options.get("onlyMainContent", True)
    exclude_tags = scrape_options.get("excludeTags", [])
    wait_for = scrape_options.get("waitFor", 0)
    timeout = scrape_options.get("timeout", 30000)
    remove_base64 = scrape_options.get("removeBase64Images", True)
    location = scrape_options.get("location", {})

    locale, timezone_id = get_locale_settings(
        location.get("country", "US"),
        location.get("languages"),
    )
    excluded_tags = get_excluded_tags(exclude_tags, only_main_content)

    # Build URL filters
    filters = [ContentTypeFilter(allowed_types=["text/html"])]

    # Path filtering
    if exclude_paths:
        exclude_patterns = [re.compile(p) for p in exclude_paths]
        filters.append(URLPatternFilter(patterns=exclude_patterns, reverse=True))
    if include_paths:
        include_patterns = [re.compile(p) for p in include_paths]
        filters.append(URLPatternFilter(patterns=include_patterns, reverse=False))

    if not crawl_entire_domain:
        # Restrict to child paths only (URLs must start with the base path)
        base_path = urlparse(url).path.rstrip("/")
        if base_path:
            base_pattern = re.escape(base_path)
            filters.append(
                URLPatternFilter(
                    patterns=[re.compile(f"^{base_pattern}(/.*)?$")], reverse=False
                )
            )

    strategy = BFSDeepCrawlStrategy(
        max_depth=max_depth,
        max_pages=limit,
        include_external=allow_external,
        filter_chain=FilterChain(filters),
    )

    browser_config = create_browser_config(
        mobile=scrape_options.get("mobile", False),
        headers=scrape_options.get("headers"),
    )

    run_config = CrawlerRunConfig(
        deep_crawl_strategy=strategy,
        stream=True,
        cache_mode=CacheMode.BYPASS,
        screenshot="screenshot" in formats,
        excluded_tags=excluded_tags if excluded_tags else None,
        delay_before_return_html=delay_ms / 1000.0 if delay_ms else wait_for / 1000.0,
        page_timeout=timeout,
        locale=locale,
        timezone_id=timezone_id,
        verbose=True,
        semaphore_count=max_concurrency,
    )

    seen_urls: set[str] = set()
    data: list[dict[str, Any]] = []

    async with AsyncWebCrawler(config=browser_config) as crawler:
        seed_urls = [url]
        if sitemap_mode == "include":
            sitemap_urls = await fetch_sitemap_urls(page, url)
            filtered_sitemap = [
                sitemap_url
                for sitemap_url in sitemap_urls
                if (
                    allow_external or is_same_domain(sitemap_url, url, allow_subdomains)
                )
                and (crawl_entire_domain or is_child_path(sitemap_url, url))
            ]
            seed_urls.extend(filtered_sitemap[:limit])

        for seed in seed_urls:
            if len(data) >= limit:
                break

            normalized = normalize_url(seed, ignore_query)
            if normalized in seen_urls:
                continue

            async for result in await crawler.arun(url=seed, config=run_config):
                if len(data) >= limit:
                    break

                if not result.success:
                    continue

                result_normalized = normalize_url(result.url, ignore_query)
                if result_normalized in seen_urls:
                    continue

                seen_urls.add(result_normalized)

                item = await build_response_item(
                    result,
                    formats,
                    remove_base64_images=remove_base64,
                )

                data.append(item)

    return {
        "success": True,
        "status": "completed",
        "total": len(data),
        "completed": len(data),
        "data": data,
    }
