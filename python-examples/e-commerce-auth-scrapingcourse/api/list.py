from playwright.async_api import Page
from typing import TypedDict, List, Optional
from runtime_helpers import extend_payload
from intuned_browser import go_to_url


class Product(TypedDict):
    name: str
    detailsUrl: str


async def extract_products_from_page(page: Page) -> List[Product]:
    # Wait for the product grid to be visible
    # This ensures the page has loaded before we try to extract data
    product_grid = page.locator("#product-grid")
    await product_grid.wait_for(state="visible")

    # Find all product items within the grid
    # Each product is contained in a div with class "product-item"
    product_items = await product_grid.locator(".product-item").all()

    # Array to store all extracted product data
    products: List[Product] = []

    for product_item in product_items:
        try:
            # Extract the product name
            name_element = product_item.locator(".product-name")
            name = await name_element.text_content()

            # Extract the product detail page URL
            link_element = product_item.locator("a")
            product_url = await link_element.get_attribute("href")

            # Only add the product if all required fields were found
            if name and product_url:
                product: Product = {
                    "name": name.strip(),
                    "detailsUrl": product_url.strip(),
                }

                products.append(product)
                # extend the payload to trigger the details API
                extend_payload(
                    {
                        "api": "details",
                        "parameters": product,
                    }
                )
        except Exception as error:
            # If extraction fails for a single product, log it but continue with others
            print(f"Failed to extract product data: {error}")
            continue

    return products


async def automation(
    page: Page,
    params: Optional[dict] = None,
    **_kwargs,
) -> List[Product]:
    # Validate input parameters using schema
    if params is None:
        params = {}

    # Navigate to the dashboard page
    await go_to_url(
        page=page,
        url="https://www.scrapingcourse.com/dashboard",
    )

    # Extract all product details from the page
    products = await extract_products_from_page(page)

    # Return all extracted products
    return products
