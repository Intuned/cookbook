from playwright.async_api import Page
from urllib.parse import urlparse

from intuned_browser import resolve_url


def get_base_domain(url: str) -> str:
    parsed = urlparse(url)
    return parsed.netloc.lower()


def normalize_url(url: str) -> str:
    """
    Normalize URL to prevent duplicates.

    - Removes fragments (#section)
    - Normalizes trailing slashes
    - Lowercases domain
    """
    parsed = urlparse(url)
    path = parsed.path.rstrip("/") or "/"
    return f"{parsed.scheme}://{parsed.netloc.lower()}{path}"


async def extract_links(
    page: Page,
    base_domain: str,
    include_external: bool = False,
) -> list[str]:
    """
    Extract all links from the current page.

    Args:
        page: Playwright page object (already navigated)
        base_domain: Domain to filter links
        include_external: Whether to include external links (ignores base_domain)

    Returns:
        List of normalized, deduplicated URLs
    """
    current_url = page.url

    hrefs = await page.eval_on_selector_all(
        "a[href]", "elements => elements.map(e => e.getAttribute('href'))"
    )

    links = []
    for href in hrefs:
        if not href:
            continue

        if href.startswith(("javascript:", "mailto:", "tel:", "#")):
            continue

        try:
            full_url = await resolve_url(url=href, base_url=current_url)
        except Exception:
            print(f"Failed to resolve URL: {href}")
            continue

        link_domain = get_base_domain(full_url)
        if link_domain == base_domain or include_external:
            normalized = normalize_url(full_url)
            links.append(normalized)

    return list(set(links))


FILE_EXTENSIONS = {
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".csv",
    ".zip",
    ".png",
    ".jpg",
}


def is_file_url(url: str) -> bool:
    path = urlparse(url).path.lower()
    return any(path.endswith(ext) for ext in FILE_EXTENSIONS)
