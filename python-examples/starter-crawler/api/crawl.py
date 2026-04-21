"""
Minimal native crawler starter: visit a URL and extract internal links.

This is a one-step, single-depth version of the full native-crawler template.
"""

from typing import TypedDict
from urllib.parse import urljoin, urlparse

from intuned_browser import go_to_url
from playwright.async_api import BrowserContext, Page


class Params(TypedDict, total=False):
    url: str
    max_links: int


async def automation(
    page: Page,
    params: Params,
    context: BrowserContext | None = None,
    **_kwargs,
):
    url = params.get("url")
    if not url:
        return {"success": False, "error": "url parameter is required"}

    max_links = params.get("max_links", 20)
    base_domain = urlparse(url).netloc

    await go_to_url(page, url)
    title = await page.title()

    hrefs = await page.eval_on_selector_all(
        "a[href]", "els => els.map(e => e.getAttribute('href'))"
    )

    links: list[str] = []
    seen: set[str] = set()
    for href in hrefs:
        if not href:
            continue
        absolute = urljoin(url, href).split("#")[0]
        if urlparse(absolute).netloc != base_domain:
            continue
        if absolute in seen:
            continue
        seen.add(absolute)
        links.append(absolute)
        if len(links) >= max_links:
            break

    return {
        "success": True,
        "url": url,
        "title": title,
        "links": links,
        "count": len(links),
    }
