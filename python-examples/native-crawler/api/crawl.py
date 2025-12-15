from playwright.async_api import Page, BrowserContext
from typing import TypedDict

from intuned_browser import go_to_url, wait_for_dom_settled
from runtime_helpers import extend_payload
from intuned_runtime import persistent_store
from runtime.context import IntunedContext

from utils import extract_links, extract_page_content, normalize_url, get_base_domain


class Params(TypedDict, total=False):
    url: str
    max_depth: int
    max_pages: int
    depth: int  # Current depth (internal, set by extend_payload)


def sanitize_key(key: str) -> str:
    for char in ["://", "/", ":", "#", "?", "&", "=", ".", "-"]:
        key = key.replace(char, "_")
    while "__" in key:
        key = key.replace("__", "_")
    return key.strip("_")


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
    depth = params.get("depth", 0)

    # Get job_run_id to prefix all keys (isolates each job's data)
    job_run_id = IntunedContext.current().run_context.job_run_id or "local"
    key_prefix = f"{job_run_id}_"

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
    visited_key = sanitize_key(f"{key_prefix}visited_{normalized_url}")
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
    await wait_for_dom_settled(page)

    # Extract page content
    content = await extract_page_content(page)

    # Find all internal links
    links = await extract_links(page, base_domain, include_external=False)
    print(f"[crawl] Found {len(links)} links on {url}")

    # Queue new links for crawling (if under depth limit)
    links_queued = 0
    next_depth = depth + 1

    if next_depth <= max_depth:
        for link in links:
            # Only queue if not already visited
            link_key = sanitize_key(f"{key_prefix}visited_{link}")
            if not await persistent_store.get(link_key):
                extend_payload(
                    {
                        "api": "crawl",
                        "parameters": {
                            "url": link,
                            "depth": next_depth,
                        },
                    }
                )
                links_queued += 1

    # Return page data + crawl stats
    return {
        "success": True,
        "url": url,
        "depth": depth,
        "content": content,
        "links_found": len(links),
        "links_queued": links_queued,
    }
