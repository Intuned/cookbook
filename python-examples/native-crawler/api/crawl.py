from typing import TypedDict

from intuned_browser import go_to_url, save_file_to_s3
from intuned_runtime import persistent_store
from playwright.async_api import BrowserContext, Page
from runtime_helpers import extend_payload
from utils import (
    extract_links,
    extract_page_content,
    get_base_domain,
    is_file_url,
    normalize_url,
    sanitize_key,
)
from utils.helpers import get_job_run_id


class Params(TypedDict, total=False):
    url: str
    max_depth: int
    max_pages: int
    include_external: bool
    include_attachments: bool
    schema: dict
    depth: int  # Current depth (internal, set by extend_payload)


async def automation(
    page: Page,
    params: Params,
    context: BrowserContext | None = None,
    **_kwargs,
):
    """
    Crawl a URL: extract content and discover links.

    This API:
    1. Navigates to the given URL
    2. Extracts the page content as markdown
    3. Extracts all internal links
    4. For each new link, extends payload to crawl it (if under depth limit)
    5. Uses persistent_store to deduplicate URLs across all job payloads

    Example params:
    {
        "url": "https://books.toscrape.com",
        "max_depth": 2,
        "max_pages": 50
    }

    When run as a job, this creates a fan-out pattern:
    - Payload 1: crawl(seed_url) → finds 50 links → extend_payload x 50
    - Payloads 2-51: crawl(link) → each finds more links → extend_payload x N
    - All payloads share the same persistent_store, preventing duplicate work
    """
    url = params["url"]
    max_depth = params.get("max_depth", 2)
    max_pages = params.get("max_pages", 50)
    include_external = params.get("include_external", False)
    include_attachments = params.get("include_attachments", False)
    schema = params.get("schema")
    depth = params.get("depth", 0)

    key_prefix = str(get_job_run_id())
    normalized_url = normalize_url(url)

    # Store config for child payloads (only on first call)
    base_domain = get_base_domain(url)
    if depth == 0:
        await persistent_store.set(f"{key_prefix}__base_domain__", base_domain)
    else:
        base_domain = (
            await persistent_store.get(f"{key_prefix}__base_domain__") or base_domain
        )

    # Deduplicate
    visited_key = sanitize_key(f"{key_prefix}_visited_{normalized_url}")
    if await persistent_store.get(visited_key):
        return {
            "success": True,
            "url": url,
            "skipped": True,
            "reason": "already visited",
        }

    # Page limit check
    page_count = await persistent_store.get(f"{key_prefix}__page_count__") or 0
    if page_count >= max_pages:
        return {
            "success": True,
            "url": url,
            "skipped": True,
            "reason": "max_pages limit reached",
        }

    # Mark as visited and increment counter
    await persistent_store.set(visited_key, True)
    await persistent_store.set(f"{key_prefix}__page_count__", page_count + 1)

    # Navigate
    print(f"[crawl] Depth {depth}/{max_depth}: {url}")
    await go_to_url(page, url)

    # Extract page content
    content = await extract_page_content(page, schema=schema)

    # Find all internal links
    links = await extract_links(page, base_domain, include_external=include_external)
    print(f"[crawl] Found {len(links)} links on {url}")
    attachments = []

    # Queue new links for crawling (if under depth limit)
    links_queued = 0
    next_depth = depth + 1

    if next_depth <= max_depth:
        for link in links:
            if not is_file_url(link):
                # Only queue if not already visited
                link_key = sanitize_key(f"{key_prefix}_visited_{link}")
                if not await persistent_store.get(link_key):
                    extend_payload(
                        {
                            "api": "crawl",
                            "parameters": {
                                "url": link,
                                "depth": next_depth,
                                "include_external": include_external,
                                "schema": schema,
                            },
                        }
                    )
                    links_queued += 1
            elif include_attachments:
                try:
                    uploaded = await save_file_to_s3(
                        page=page,
                        trigger=link,
                    )
                    attachments.append(uploaded)
                except Exception as e:
                    print(f"[crawl] Failed to download {link}: {e}")

    return {
        "success": True,
        "url": url,
        "depth": depth,
        "content": content,
        "links_found": len(links),
        "links_queued": links_queued,
        "attachments": attachments,
    }
