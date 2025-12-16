"""
Scrape a webpage with multiple output formats.

Firecrawl-compatible /scrape endpoint using crawl4ai.
https://docs.firecrawl.dev/api-reference/endpoint/scrape
"""

from playwright.async_api import Page, BrowserContext
from typing import TypedDict, Any
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, CacheMode

from utils import (
    LocationParams,
    FormatType,
    get_locale_settings,
    create_browser_config,
    get_excluded_tags,
    remove_base64_images,
    build_css_selector,
    extract_metadata,
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

        data: dict[str, Any] = {"metadata": extract_metadata(result, url)}

        if "markdown" in formats:
            markdown = result.markdown or ""
            if remove_base64:
                markdown = remove_base64_images(markdown)
            data["markdown"] = markdown

        if "html" in formats:
            data["html"] = result.cleaned_html

        if "rawHtml" in formats:
            data["rawHtml"] = result.html

        if "links" in formats:
            internal = [link.get("href") for link in result.links.get("internal", [])]
            external = [link.get("href") for link in result.links.get("external", [])]
            data["links"] = internal + external

        if "images" in formats:
            data["images"] = [img.get("src") for img in result.media.get("images", [])]

        if "screenshot" in formats:
            data["screenshot"] = result.screenshot

        return {"success": True, "data": data}
