"""
Minimal BeautifulSoup starter: scrape product listings from a single page.
"""

from typing import TypedDict

from bs4 import BeautifulSoup
from intuned_browser import go_to_url
from playwright.async_api import BrowserContext, Page


class Params(TypedDict, total=False):
    url: str


async def automation(
    page: Page,
    params: Params,
    context: BrowserContext | None = None,
    **_kwargs,
):
    url = params.get("url")
    if not url:
        raise ValueError("url is required")

    await go_to_url(page, url)
    await page.wait_for_selector("li.product")

    html = await page.content()
    soup = BeautifulSoup(html, "html.parser")

    products = []
    for product in soup.select("li.product"):
        title_el = product.select_one("h2.woocommerce-loop-product__title")
        price_el = product.select_one("span.woocommerce-Price-amount")
        link_el = product.select_one("a.woocommerce-LoopProduct-link")
        if not title_el or not link_el:
            continue
        products.append(
            {
                "title": title_el.get_text(strip=True),
                "price": price_el.get_text(strip=True) if price_el else "",
                "details_url": link_el.get("href", ""),
            }
        )

    return {"count": len(products), "products": products}
