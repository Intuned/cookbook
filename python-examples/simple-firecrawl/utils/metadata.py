from typing import Any
from crawl4ai import CrawlResult


def extract_metadata(result: CrawlResult, source_url: str) -> dict[str, Any]:
    meta = result.metadata or {}

    return {
        "title": meta.get("title", ""),
        "description": meta.get("description", ""),
        "language": meta.get("language", ""),
        "keywords": meta.get("keywords", ""),
        "ogTitle": meta.get("og:title", ""),
        "ogDescription": meta.get("og:description", ""),
        "ogUrl": meta.get("og:url", ""),
        "ogImage": meta.get("og:image", ""),
        "ogSiteName": meta.get("og:site_name", ""),
        "sourceURL": source_url,
        "statusCode": result.status_code or 200,
    }
