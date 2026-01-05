import re
from typing import TypedDict

from intuned_browser import go_to_url
from playwright.async_api import BrowserContext, Page


class Params(TypedDict):
    name: str
    vendor: str
    product_type: str
    tags: list[str]
    details_url: str


class ProductVariant(TypedDict):
    sku: str
    title: str
    price: str
    compare_at_price: str | None
    available: bool
    inventory_quantity: int


class ProductDetails(TypedDict, total=False):
    source_url: str
    id: int
    name: str
    handle: str
    vendor: str
    product_type: str
    tags: list[str]
    description: str
    price: str
    images: list[str]
    options: list[dict]
    variants: list[ProductVariant]


def strip_html(html: str) -> str:
    """Remove HTML tags from a string"""
    if not html:
        return ""
    clean = re.sub(r"<[^>]+>", "", html)
    clean = re.sub(r"\s+", " ", clean)
    return clean.strip()


def extract_product_from_json(data: dict, params: Params) -> ProductDetails:
    """
    Extracts product details from Shopify JSON response.
    Uses params from list API for name, vendor, product_type, tags.
    Fetches additional details (description, images, variants) from JSON.
    """
    product = data.get("product", {})

    # Extract image URLs
    images = [img.get("src", "") for img in product.get("images", [])]

    # Extract variants
    raw_variants = product.get("variants", [])
    variants: list[ProductVariant] = []
    if len(raw_variants) > 1:
        # if there are multiple variants, collect all of them
        for variant in raw_variants:
            variants.append(
                {
                    "sku": variant.get("sku", ""),
                    "title": variant.get("title", ""),
                    "price": variant.get("price", ""),
                    "compare_at_price": variant.get("compare_at_price"),
                    "available": variant.get(
                        "available", variant.get("inventory_quantity", 0) > 0
                    ),
                    "inventory_quantity": variant.get("inventory_quantity", 0),
                }
            )

    # Get price from first variant
    price = raw_variants[0]["price"] if raw_variants else ""

    # Filter out options with name "Title" (default/empty options)
    options = [opt for opt in product.get("options", []) if opt.get("name") != "Title"]

    result: ProductDetails = {
        "source_url": params["details_url"],
        "id": product.get("id", 0),
        "name": params["name"],
        "handle": product.get("handle", ""),
        "vendor": params["vendor"],
        "product_type": params["product_type"],
        "tags": params["tags"],
        "description": strip_html(product.get("body_html", "")),
        "price": price,
        "images": images,
        "options": options,
        "variants": variants,
    }

    return result


async def automation(
    page: Page,
    params: Params | None = None,
    context: BrowserContext | None = None,
    **_kwargs,
):
    """
    Fetches product details from Shopify JSON API.
    Appends .json to the details_url to get the JSON endpoint.
    Works with any Shopify store.
    """
    if not params or not params.get("details_url"):
        raise ValueError("Params are required for this automation")

    details_url = params["details_url"]
    await go_to_url(page, details_url)
    # Build JSON endpoint URL
    json_url = f"{details_url}.json"
    print(f"Fetching: {json_url}")

    response = await page.request.get(json_url)
    data = await response.json()

    product_details = extract_product_from_json(data, params)

    return product_details
