import base64
from typing import Any
from crawl4ai import CrawlResult
from intuned_browser import upload_file_to_s3

from .content import remove_base64_images as _remove_base64_images


def extract_metadata(result: CrawlResult, source_url: str) -> dict[str, Any]:
    """Extract Firecrawl-compatible metadata from CrawlResult."""
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


async def build_response_item(
    result: CrawlResult,
    formats: list[str],
    remove_base64_images: bool = True,
) -> dict[str, Any]:
    """Build a Firecrawl-compatible response item from CrawlResult."""
    item: dict[str, Any] = {"metadata": extract_metadata(result, result.url)}

    if "markdown" in formats:
        markdown = result.markdown or ""
        if remove_base64_images:
            markdown = _remove_base64_images(markdown)
        item["markdown"] = markdown

    if "html" in formats:
        item["html"] = result.cleaned_html

    if "rawHtml" in formats:
        item["rawHtml"] = result.html

    if "links" in formats:
        internal = [link.get("href") for link in result.links.get("internal", [])]
        external = [link.get("href") for link in result.links.get("external", [])]
        item["links"] = internal + external

    if "images" in formats:
        item["images"] = [img.get("src") for img in result.media.get("images", [])]

    if "screenshot" in formats and result.screenshot:
        screenshot_bytes = base64.b64decode(result.screenshot)
        uploaded = await upload_file_to_s3(
            file=screenshot_bytes,
            file_name_override="screenshot.png",
            content_type="image/png",
        )
        signed_url = await uploaded.get_signed_url()
        item["screenshot"] = signed_url

    return item
