"""
Crawl a website and all its accessible subpages.

Firecrawl-compatible /crawl endpoint using crawl4ai.
https://docs.firecrawl.dev/api-reference/endpoint/crawl-post
"""

from urllib.parse import urlparse
from playwright.async_api import Page, BrowserContext
from typing import TypedDict, Literal, Any
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, CacheMode
from crawl4ai.deep_crawling import BFSDeepCrawlStrategy
from crawl4ai.deep_crawling.filters import (
    FilterChain,
    ContentTypeFilter,
    URLPatternFilter,
)

from utils import (
    LocationParams,
    get_locale_settings,
    create_browser_config,
    normalize_url,
    is_subdomain_of,
    fetch_sitemap_urls,
    get_excluded_tags,
    build_response_item,
)


class ScrapeOptions(TypedDict, total=False):
    formats: list[str]
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
    if exclude_paths:
        filters.append(URLPatternFilter(patterns=exclude_paths, match_type="exclude"))
    if include_paths:
        filters.append(URLPatternFilter(patterns=include_paths, match_type="include"))

    if not crawl_entire_domain:
        # Restrict to child paths only (URLs must start with the base path)
        base_path = urlparse(url).path.rstrip("/") or ""
        if base_path:
            filters.append(
                URLPatternFilter(patterns=[f".*{base_path}.*"], match_type="include")
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
    )

    seen_urls: set[str] = set()
    data: list[dict[str, Any]] = []

    async with AsyncWebCrawler(config=browser_config) as crawler:
        seed_urls = [url]
        if sitemap_mode == "include":
            sitemap_urls = await fetch_sitemap_urls(page, url)
            seed_urls.extend(sitemap_urls[:limit])

        for seed in seed_urls:
            if len(data) >= limit:
                break

            normalized = normalize_url(seed, ignore_query)
            if normalized in seen_urls:
                continue

            if not allow_external and not allow_subdomains:
                if not is_subdomain_of(seed, url):
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
