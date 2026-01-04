from typing import TypedDict
from urllib.parse import urlparse

from intuned_browser import go_to_url
from intuned_runtime import extend_payload
from playwright.async_api import BrowserContext, Page


class Params(TypedDict, total=False):
    store_url: str  # The Shopify store URL (e.g., "https://the-outrage.com")
    max_pages: int  # Maximum number of pages to scrape (default: 10)


class Product(TypedDict):
    name: str
    vendor: str
    product_type: str
    tags: list[str]
    details_url: str


LIMIT = 250


def extract_products(data: dict, product_base_url: str) -> list[Product]:
    """
    Extracts product info from JSON response
    """
    products: list[Product] = []

    for product in data.get("products", []):
        product_handle = product.get("handle", "")
        products.append(
            {
                "name": product.get("title", ""),
                "vendor": product.get("vendor", ""),
                "product_type": product.get("product_type", ""),
                "tags": product.get("tags", []),
                "details_url": f"{product_base_url}{product_handle}",
            }
        )

    return products


async def automation(
    page: Page,
    params: Params | None = None,
    context: BrowserContext | None = None,
    **_kwargs,
):
    """
    Scrapes all products from any Shopify store using the JSON API with pagination.
    Each product's details will be scraped separately using the extend_payload mechanism.

    Example params:
    {
        "store_url": "https://the-outrage.com",
        "max_pages": 10
    }

    This function collects product metadata (name, vendor, type, tags, details_url)
    and then uses extend_payload to trigger individual scrapes for each product's details.
    """
    if not params or not params.get("store_url"):
        raise ValueError("store_url is required in params")

    store_url = params["store_url"].rstrip("/")

    # Parse and validate the store URL
    parsed_url = urlparse(store_url)
    if not parsed_url.scheme or not parsed_url.netloc:
        raise ValueError(f"Invalid store URL: {store_url}")

    # Construct the base URLs
    base_url = f"{store_url}/products.json"
    product_base_url = f"{store_url}/products/"

    print(f"Shopify store: {store_url}")
    print(f"Products API: {base_url}")

    # Get max_pages from params or default to 10
    max_pages = params.get("max_pages", 10)

    # Navigate to the store home page
    await go_to_url(page, store_url)

    all_products: list[Product] = []
    current_page = 1

    while current_page <= max_pages:
        url = f"{base_url}?limit={LIMIT}&page={current_page}"
        print(f"Fetching page {current_page}/{max_pages}: {url}")

        response = await page.request.get(url)
        data = await response.json()

        products = extract_products(data, product_base_url)

        if not products:
            print("No more products found")
            break

        all_products.extend(products)
        print(f"Extracted {len(products)} products from page {current_page}")

        current_page += 1

    print(f"Total products scraped: {len(all_products)}")
    for product in all_products:
        extend_payload(
            {
                "api": "shopify-details",
                "parameters": dict(product),
            }
        )
    return {"products": all_products}
