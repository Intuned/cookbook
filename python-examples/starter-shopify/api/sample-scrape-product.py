"""
Minimal Shopify starter: fetch a single product from a Shopify store's JSON
endpoint and return the cleaned details.
"""

import re
from typing import TypedDict

from intuned_browser import go_to_url
from playwright.async_api import BrowserContext, Page


class Params(TypedDict):
    product_url: str


def strip_html(html: str) -> str:
    if not html:
        return ""
    clean = re.sub(r"<[^>]+>", "", html)
    return re.sub(r"\s+", " ", clean).strip()


async def automation(
    page: Page,
    params: Params,
    context: BrowserContext | None = None,
    **_kwargs,
):
    product_url = params.get("product_url") if params else None
    if not product_url:
        raise ValueError("product_url is required")

    await go_to_url(page, product_url)

    json_url = f"{product_url.rstrip('/')}.json"
    response = await page.request.get(json_url)
    data = await response.json()
    product = data.get("product", {})

    variants = product.get("variants", [])
    return {
        "source_url": product_url,
        "id": product.get("id"),
        "name": product.get("title", ""),
        "handle": product.get("handle", ""),
        "vendor": product.get("vendor", ""),
        "product_type": product.get("product_type", ""),
        "tags": product.get("tags", []),
        "description": strip_html(product.get("body_html", "")),
        "price": variants[0]["price"] if variants else "",
        "images": [img.get("src", "") for img in product.get("images", [])],
    }
