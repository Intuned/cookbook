import xml.etree.ElementTree as ET
from urllib.parse import urlparse
from playwright.async_api import Page
from intuned_browser import go_to_url


async def fetch_sitemap_urls(page: Page, base_url: str) -> list[str]:
    """Fetch and parse sitemap.xml to extract URLs"""
    parsed = urlparse(base_url)
    sitemap_url = f"{parsed.scheme}://{parsed.netloc}/sitemap.xml"

    try:
        await go_to_url(page, sitemap_url)
        content = await page.content()

        if not content:
            return []

        root = ET.fromstring(content)
        ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}

        urls = []
        for loc in root.findall(".//sm:loc", ns):
            if loc.text:
                urls.append(loc.text.strip())

        # Fallback without namespace
        if not urls:
            for loc in root.iter():
                if loc.tag.endswith("loc") and loc.text:
                    urls.append(loc.text.strip())

        return urls
    except Exception:
        return []
