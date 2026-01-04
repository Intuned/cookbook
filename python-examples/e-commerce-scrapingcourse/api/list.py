# List products from e-commerce site with pagination
from typing import TypedDict

from intuned_browser import go_to_url
from playwright.async_api import Page
from runtime_helpers import extend_payload
from utils.types_and_schemas import ListSchema


class Params(TypedDict):
    limit: int


class Product(TypedDict):
    name: str
    detailsUrl: str


async def has_next_page(page: Page) -> bool:
    # Look for the "next" button in the pagination
    # The next button has class "next page-numbers" and is a link (not disabled)
    next_button = page.locator("a.next.page-numbers")

    # Check if the next button exists on the page
    # If it exists, there is a next page available
    count = await next_button.count()

    return count > 0


async def extract_products_from_page(page: Page) -> list[Product]:
    # Wait for the product list container to be visible on the page
    # This ensures the page has fully loaded before we try to scrape
    products_container = page.locator("#product-list")
    await products_container.wait_for(state="visible")

    # Find all product items within the container
    # Each product is represented by an <li> element with data-products="item"
    product_elements = await products_container.locator(
        "li[data-products='item']"
    ).all()

    # Array to store all extracted product data
    products: list[Product] = []

    # Loop through each product element to extract its information
    for product_element in product_elements:
        try:
            # Extract the product name from the h2 heading
            name_element = product_element.locator("h2.product-name")
            name = await name_element.text_content()

            # Extract the product details URL from the main product link
            link_element = product_element.locator("a.woocommerce-LoopProduct-link")
            details_url = await link_element.get_attribute("href")

            # Add the product to products list
            if name and details_url:
                product: Product = {
                    "name": name.strip(),
                    "detailsUrl": details_url.strip(),
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
            # If extraction fails for a single product, log the error but continue with others
            print(f"Failed to extract product data: {error}")
            continue

    return products


async def navigate_to_next_page(page: Page) -> None:
    # Click the next page button to navigate to the next page
    # .first() because this locator resolves to multiple elements on the page
    next_button = page.locator("a.next.page-numbers").first
    await next_button.click()

    # Wait for the page to load after clicking next
    # Wait for the product list to be visible again
    await page.locator("#product-list").wait_for(state="visible")


async def automation(page: Page, params: Params, **_kwargs) -> list[Product]:
    # Get the page limit from params, default to 50 if not provided
    validated_params = ListSchema(**(params or {}))
    page_limit = validated_params.limit or 50

    # Navigate to the e-commerce website
    await go_to_url(
        page=page,
        url="https://www.scrapingcourse.com/ecommerce/",
    )

    # Array to store all products from all pages
    all_products: list[Product] = []
    current_page = 1

    # Loop through all pages until there are no more pages or limit is reached
    while True:
        print(f"Scraping page {current_page}...")

        # Extract all products from the current page
        products = await extract_products_from_page(page)

        # Add the products from this page to our complete list
        all_products.extend(products)

        # Check if we've reached the page limit
        if current_page >= page_limit:
            print(f"Reached page limit of {page_limit} pages")
            break

        # Check if there's a next page available
        has_next = await has_next_page(page)

        if not has_next:
            # No more pages - exit the loop
            print("No more pages to scrape")
            break

        # Navigate to the next page
        await navigate_to_next_page(page)

        current_page += 1

    print(
        f"Successfully scraped {len(all_products)} products from {current_page} page(s)"
    )

    # Return the scraped products
    return all_products
