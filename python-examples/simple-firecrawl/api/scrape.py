"""
Scrape a single URL and return content in multiple formats.

Firecrawl-compatible API: https://docs.firecrawl.dev/api-reference/endpoint/scrape

Implements the Firecrawl /scrape endpoint using crawl4ai.
"""

from playwright.async_api import Page, BrowserContext
from typing import TypedDict, Literal
from crawl4ai import AsyncWebCrawler
from crawl4ai.async_configs import BrowserConfig, CrawlerRunConfig


class Params(TypedDict, total=False):
    url: str
    formats: list[Literal["markdown", "html", "rawHtml", "links"]]
    onlyMainContent: bool
    includeTags: list[str]
    excludeTags: list[str]
    waitFor: int  # milliseconds
    timeout: int  # milliseconds


DEFAULTS: Params = {
    "formats": ["markdown"],
    "onlyMainContent": True,
    "includeTags": [],
    "excludeTags": [],
    "waitFor": 0,
    "timeout": 30000,
}


async def automation(
    page: Page,
    params: Params | None = None,
    context: BrowserContext | None = None,
    **_kwargs,
):
    url = params.get("url")
    if not url:
        return {"success": False, "error": "url is required"}

    formats = params.get("formats", DEFAULTS["formats"])
    only_main_content = params.get("onlyMainContent", DEFAULTS["onlyMainContent"])
    exclude_tags = params.get("excludeTags", DEFAULTS["excludeTags"])
    timeout = params.get("timeout", DEFAULTS["timeout"])

    # Map Firecrawl excludeTags to crawl4ai excluded_tags
    excluded_tags = list(exclude_tags) if exclude_tags else []
    if only_main_content:
        excluded_tags = list(
            set(excluded_tags + ["nav", "footer", "header", "aside", "script", "style"])
        )

    browser_config = BrowserConfig(verbose=True)
    run_config = CrawlerRunConfig(
        excluded_tags=excluded_tags,
        wait_until="domcontentloaded",
        page_timeout=timeout,
        verbose=True,
    )

    async with AsyncWebCrawler(config=browser_config) as crawler:
        result = await crawler.arun(url=url, config=run_config)

        if not result.success:
            return {"success": False, "error": result.error_message}

        # Build response based on requested formats
        data = {}

        if "markdown" in formats:
            data["markdown"] = result.markdown or ""

        if "html" in formats:
            data["html"] = result.cleaned_html or ""

        if "rawHtml" in formats:
            data["rawHtml"] = result.html or ""

        if "links" in formats:
            internal = result.links.get("internal", []) if result.links else []
            external = result.links.get("external", []) if result.links else []
            data["links"] = [
                l.get("href") for l in internal + external if l.get("href")
            ]

        # Always include metadata (like Firecrawl)
        metadata = result.metadata or {}
        data["metadata"] = {
            "title": metadata.get("title", ""),
            "description": metadata.get("description", ""),
            "language": metadata.get("language", ""),
            "sourceURL": result.url,
            "statusCode": 200 if result.success else 500,
        }

        return {"success": True, "data": data}
