from typing import Any
from crawl4ai import CrawlResult


def extract_metadata(result: CrawlResult, source_url: str) -> dict[str, Any]:
    meta = result.metadata or {}

    return {
        "title": meta.get("title") or "",
        "description": meta.get("description") or "",
        "language": meta.get("language") or "",
        "keywords": meta.get("keywords") or "",
        "ogTitle": meta.get("og:title") or "",
        "ogDescription": meta.get("og:description") or "",
        "ogUrl": meta.get("og:url") or "",
        "ogImage": meta.get("og:image") or "",
        "ogSiteName": meta.get("og:site_name") or "",
        "sourceURL": source_url,
        "statusCode": result.status_code or 200,
    }
