"""
Extract all links from a webpage with title and description.

Firecrawl-compatible /map endpoint using crawl4ai.
https://docs.firecrawl.dev/api-reference/endpoint/map
"""

import xml.etree.ElementTree as ET
from urllib.parse import urlparse
from playwright.async_api import Page, BrowserContext
from typing import TypedDict, Literal, Any
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, CacheMode
from crawl4ai import LinkPreviewConfig

from utils import (
    LocationParams,
    get_locale_settings,
    create_browser_config,
    normalize_url,
    is_subdomain_of,
)


class Params(TypedDict, total=False):
    url: str
    search: str
    sitemap: Literal["include", "skip", "only"]
    includeSubdomains: bool
    ignoreQueryParameters: bool
    limit: int
    timeout: int
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

    search = params.get("search", "")
    sitemap_mode = params.get("sitemap", "include")
    include_subdomains = params.get("includeSubdomains", True)
    ignore_query = params.get("ignoreQueryParameters", True)
    limit = params.get("limit", 5000)
    timeout = params.get("timeout", 30000)
    location = params.get("location", {})

    locale, timezone_id = get_locale_settings(
        location.get("country", "US"),
        location.get("languages"),
    )
    browser_config = create_browser_config()

    config = CrawlerRunConfig(
        link_preview_config=LinkPreviewConfig(
            include_internal=True,
            include_external=False,
            max_links=limit,
        ),
        cache_mode=CacheMode.BYPASS,
        page_timeout=timeout,
        locale=locale,
        timezone_id=timezone_id,
        verbose=True,
    )

    async with AsyncWebCrawler(config=browser_config) as crawler:
        seen_urls: set[str] = set()
        links: list[dict[str, Any]] = []

        # Get sitemap URLs if mode is "include" or "only"
        if sitemap_mode in ("include", "only"):
            sitemap_urls = await fetch_sitemap_urls(crawler, url)
            for sitemap_url in sitemap_urls:
                normalized = normalize_url(sitemap_url, ignore_query)
                if normalized in seen_urls:
                    continue
                if not include_subdomains and not is_subdomain_of(sitemap_url, url):
                    continue
                seen_urls.add(normalized)
                links.append({"url": sitemap_url, "title": None, "description": None})

        # Get page links if mode is "include" or "skip"
        if sitemap_mode in ("include", "skip"):
            result = await crawler.arun(url=url, config=config)

            if not result.success:
                if sitemap_mode == "skip":
                    return {"success": False, "error": result.error_message}

            if result.success:
                for link in result.links.get("internal", []):
                    link_url = link.get("href", "")
                    normalized = normalize_url(link_url, ignore_query)

                    if normalized in seen_urls:
                        continue
                    if not include_subdomains and not is_subdomain_of(link_url, url):
                        continue

                    seen_urls.add(normalized)
                    head = link.get("head_data") or {}
                    meta = head.get("meta") or {}
                    links.append(
                        {
                            "url": link_url,
                            "title": head.get("title"),
                            "description": meta.get("description", ""),
                        }
                    )

        # Filter and sort by search relevance
        if search:
            scored = [
                (
                    link,
                    score_search_match(
                        link["url"],
                        link.get("title"),
                        link.get("description"),
                        search,
                    ),
                )
                for link in links
            ]
            scored = [(link, score) for link, score in scored if score > 0]
            scored.sort(key=lambda x: x[1], reverse=True)
            links = [link for link, _ in scored]

        return {"success": True, "links": links[:limit]}


async def fetch_sitemap_urls(crawler: AsyncWebCrawler, base_url: str) -> list[str]:
    parsed = urlparse(base_url)
    sitemap_url = f"{parsed.scheme}://{parsed.netloc}/sitemap.xml"

    try:
        result = await crawler.arun(
            url=sitemap_url,
            config=CrawlerRunConfig(cache_mode=CacheMode.BYPASS, verbose=False),
        )
        if not result.success or not result.html:
            return []

        root = ET.fromstring(result.html)
        ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}

        urls = []
        for loc in root.findall(".//sm:loc", ns):
            if loc.text:
                urls.append(loc.text.strip())

        if not urls:
            for loc in root.iter():
                if loc.tag.endswith("loc") and loc.text:
                    urls.append(loc.text.strip())

        return urls
    except Exception:
        return []


def score_search_match(
    url: str,
    title: str | None,
    description: str | None,
    search: str,
) -> int:
    """
    Score how well a URL matches a search term.

    Uses weighted scoring:
    - URL matches: 3 points per occurrence
    - Title matches: 2 points per occurrence
    - Description matches: 1 point per occurrence
    """
    search_lower = search.lower()
    score = 0
    score += url.lower().count(search_lower) * 3
    score += (title or "").lower().count(search_lower) * 2
    score += (description or "").lower().count(search_lower) * 1
    return score
