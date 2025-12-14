"""
Scrape a webpage with multiple output formats.

Firecrawl-compatible /scrape endpoint. Supports markdown, html, rawHtml, links, images, screenshot.
"""

from playwright.async_api import Page, BrowserContext
from typing import TypedDict, Literal
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, CacheMode


class Params(TypedDict, total=False):
    url: str
    formats: list[
        Literal["markdown", "html", "rawHtml", "links", "images", "screenshot"]
    ]


async def automation(
    page: Page,
    params: Params | None = None,
    context: BrowserContext | None = None,
    **_kwargs,
):
    url = params.get("url")
    if not url:
        return {"success": False, "error": "url parameter is required"}

    formats = params.get("formats", ["markdown"])

    config = CrawlerRunConfig(
        screenshot="screenshot" in formats,
        cache_mode=CacheMode.BYPASS,
        verbose=True,
    )

    async with AsyncWebCrawler() as crawler:
        result = await crawler.arun(url=url, config=config)

        if not result.success:
            return {"success": False, "error": result.error_message}

        meta = result.metadata or {}
        data = {
            "metadata": {
                "title": meta.get("title", ""),
                "description": meta.get("description", ""),
                "language": meta.get("language", ""),
                "keywords": meta.get("keywords", ""),
                "robots": meta.get("robots", ""),
                "ogTitle": meta.get("og:title", ""),
                "ogDescription": meta.get("og:description", ""),
                "ogUrl": meta.get("og:url", ""),
                "ogImage": meta.get("og:image", ""),
                "ogSiteName": meta.get("og:site_name", ""),
                "sourceURL": url,
                "statusCode": 200,
            }
        }

        if "markdown" in formats:
            data["markdown"] = result.markdown

        if "html" in formats:
            data["html"] = result.cleaned_html

        if "rawHtml" in formats:
            data["rawHtml"] = result.html

        if "links" in formats:
            data["links"] = [link["href"] for link in result.links.get("internal", [])]

        if "images" in formats:
            data["images"] = [img.get("src") for img in result.media.get("images", [])]

        if "screenshot" in formats:
            data["screenshot"] = result.screenshot

        return {"success": True, "data": data}
