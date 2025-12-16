"""
Scrape a webpage with multiple output formats.

Firecrawl-compatible /scrape endpoint using crawl4ai.
https://docs.firecrawl.dev/api-reference/endpoint/scrape
"""

from playwright.async_api import Page, BrowserContext
from typing import TypedDict
from crawl4ai import AsyncWebCrawler
from crawl4ai.async_configs import CrawlerRunConfig, CacheMode
from intuned_runtime import attempt_store

from utils import (
    LocationParams,
    FormatType,
    get_locale_settings,
    create_browser_config,
    get_excluded_tags,
    build_css_selector,
    build_response_item,
)


class Params(TypedDict, total=False):
    url: str
    formats: list[FormatType]
    onlyMainContent: bool
    includeTags: list[str]
    excludeTags: list[str]
    waitFor: int
    mobile: bool
    skipTlsVerification: bool
    timeout: int
    headers: dict[str, str]
    removeBase64Images: bool
    location: LocationParams


async def automation(
    page: Page,
    params: Params,
    context: BrowserContext | None = None,
    **_kwargs,
):
    url = params.get("url")
    if not url:
        return {"success": False, "error": "url parameter is required"}

    formats = params.get("formats", ["markdown"])
    only_main_content = params.get("onlyMainContent", True)
    include_tags = params.get("includeTags", [])
    exclude_tags = params.get("excludeTags", [])
    wait_for = params.get("waitFor", 0)
    mobile = params.get("mobile", False)
    skip_tls = params.get("skipTlsVerification", True)
    timeout = params.get("timeout", 30000)
    headers = params.get("headers", {})
    remove_base64 = params.get("removeBase64Images", True)
    location = params.get("location", {})

    excluded_tags = get_excluded_tags(exclude_tags, only_main_content)
    css_selector = build_css_selector(include_tags)
    locale, timezone_id = get_locale_settings(
        location.get("country", "US"),
        location.get("languages"),
    )
    browser_config = create_browser_config(
        cdp_url=attempt_store.get("cdp_url"),
        mobile=mobile,
        headers=headers if headers else None,
        skip_tls_verification=skip_tls,
    )

    run_config = CrawlerRunConfig(
        screenshot="screenshot" in formats,
        cache_mode=CacheMode.BYPASS,
        excluded_tags=excluded_tags if excluded_tags else None,
        css_selector=css_selector,
        delay_before_return_html=wait_for / 1000.0 if wait_for else 0,
        page_timeout=timeout,
        locale=locale,
        timezone_id=timezone_id,
        verbose=True,
    )

    async with AsyncWebCrawler(config=browser_config) as crawler:
        result = await crawler.arun(url=url, config=run_config)

        if not result.success:
            return {"success": False, "error": result.error_message}

        data = await build_response_item(
            result,
            formats,
            remove_base64_images=remove_base64,
        )

        return {"success": True, "data": data}
