"""
Search the web and get full content from results.

Firecrawl-compatible /search endpoint using Tavily API.
https://docs.firecrawl.dev/api-reference/endpoint/search

To use this endpoint please register to tavily.com (they provide free credits for testing).
And enter your API key in tavily_api_key parameter.
"""

from typing import Any, Literal, TypedDict

from playwright.async_api import BrowserContext, Page
from tavily import TavilyClient

CATEGORY_DOMAINS = {
    "github": ["github.com"],
    "research": [
        "arxiv.org",
        "nature.com",
        "ieee.org",
        "pubmed.ncbi.nlm.nih.gov",
        "scholar.google.com",
        "sciencedirect.com",
        "springer.com",
        "acm.org",
    ],
}

# Firecrawl tbs → Tavily time_range
TIME_RANGE_MAP = {
    "past_day": "day",
    "past_week": "week",
    "past_month": "month",
    "past_year": "year",
}


class CategoryParams(TypedDict, total=False):
    type: Literal["github", "research", "pdf"]


class ScrapeOptions(TypedDict, total=False):
    formats: list[Literal["markdown"]]  # Only markdown is supported


class Params(TypedDict, total=False):
    query: str
    limit: int
    sources: list[Literal["web", "images", "news"]]
    categories: list[CategoryParams]
    tbs: str  # Time-based search
    location: str
    country: str
    timeout: int
    scrapeOptions: ScrapeOptions
    api_key: str  # Tavily API key


async def automation(
    page: Page,
    params: Params,
    context: BrowserContext | None = None,
    **_kwargs,
):
    query = params.get("query")
    if not query:
        return {"success": False, "error": "query parameter is required"}

    api_key = params.get("api_key")
    if not api_key:
        return {
            "success": False,
            "error": "api_key parameter is required (Tavily API key)",
        }

    limit = params.get("limit", 5)
    sources = params.get("sources", ["web"])
    categories = params.get("categories", [])
    tbs = params.get("tbs")
    country = params.get("country")
    scrape_options = params.get("scrapeOptions", {})

    include_domains: list[str] = []
    for cat in categories:
        cat_type = cat.get("type")
        if cat_type in CATEGORY_DOMAINS:
            include_domains.extend(CATEGORY_DOMAINS[cat_type])

    topic = "news" if "news" in sources else "general"

    time_range = TIME_RANGE_MAP.get(tbs) if tbs else None

    include_raw = bool(scrape_options.get("formats"))
    include_images = "images" in sources

    try:
        client = TavilyClient(api_key=api_key)

        response = client.search(
            query=query,
            topic=topic,
            max_results=limit,
            include_images=include_images,
            include_raw_content="markdown" if include_raw else False,
            include_domains=include_domains if include_domains else None,
            time_range=time_range,
            country=country.lower() if country else None,
        )

        data: dict[str, Any] = {}

        if "web" in sources or "news" in sources:
            results = []
            for i, result in enumerate(response.get("results", [])):
                item: dict[str, Any] = {
                    "url": result.get("url"),
                    "title": result.get("title"),
                    "description": result.get("content"),
                    "position": i + 1,
                }
                if include_raw and result.get("raw_content"):
                    item["markdown"] = result.get("raw_content")
                results.append(item)

            if "web" in sources:
                data["web"] = results
            if "news" in sources:
                data["news"] = results

        if include_images:
            images = []
            for i, img in enumerate(response.get("images", [])):
                if isinstance(img, str):
                    images.append({"imageUrl": img, "position": i + 1})
                elif isinstance(img, dict):
                    images.append(
                        {
                            "imageUrl": img.get("url"),
                            "title": img.get("description", ""),
                            "position": i + 1,
                        }
                    )
            data["images"] = images

        return {"success": True, "data": data}

    except Exception as e:
        return {"success": False, "error": str(e)}
