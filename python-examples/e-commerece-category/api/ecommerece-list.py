from urllib.parse import urljoin

from intuned_browser import click_until_exhausted, go_to_url
from intuned_runtime import extend_payload
from playwright.async_api import BrowserContext, Page
from utils.types_and_schemas import EcommereceListParams, Product


async def handle_modal(page: Page) -> None:
    """
    Handle country/language modal if present.
    Replace the selector with the appropriate one for your store.
    """
    try:
        modal_btn = await page.query_selector(
            "#countrySwitcherModal .btn.btn-primary.dark-theme.full"
        )
        if modal_btn:
            await modal_btn.click()
    except Exception:
        pass


async def load_all_products(page: Page) -> None:
    """
    Loads all products by clicking the "Load More" button until exhausted.
    Replace the selectors with the appropriate ones for your store.
    """
    # Replace "button.more" with the appropriate selector for your store's load more button
    load_more_button = page.locator("button.more")
    # Replace with your product container selector
    product_container = page.locator(".product-grid")

    await click_until_exhausted(
        page=page,
        button_locator=load_more_button,
        container_locator=product_container,
        max_clicks=50,
        click_delay=2.0,
    )


async def extract_products(page: Page, category_url: str) -> list[Product]:
    """
    Extracts product info from the loaded page.
    Replace the selectors with the appropriate ones for your store.
    """
    products: list[Product] = []

    # Replace ".product-tile__link" with the appropriate selector for your store
    product_links = await page.query_selector_all(".product-tile__link")

    for link in product_links:
        href = await link.get_attribute("href")

        # Extract title - replace with appropriate selector
        title_element = await link.query_selector(".product-tile__name")
        name = await title_element.inner_text() if title_element else ""

        # Extract price - replace with appropriate selector
        price_element = await link.query_selector(".product-tile__price .current")
        price = await price_element.inner_text() if price_element else ""

        if href:
            details_url = urljoin(category_url, href)
            products.append(
                {
                    "name": name.strip() if name else "",
                    "price": price.strip() if price else "",
                    "details_url": details_url,
                }
            )

    return products


async def find_entity(page: Page, url: str) -> None:
    await go_to_url(page=page, url=url)
    try:
        await page.wait_for_selector("#onetrust-accept-btn-handler", timeout=5000)
        await page.click("#onetrust-accept-btn-handler")
        print("Accepted cookies")
        await page.wait_for_timeout(1000)
    except Exception:
        pass


async def automation(
    page: Page,
    params: EcommereceListParams,
    context: BrowserContext | None = None,
    **_kwargs,
):
    """
    Scrapes all products from a category page using "Load More" pagination.
    Each product's details will be scraped separately using the extend_payload mechanism.

    Example params:
    {
        "category_name": "Shoes",
        "category_url": "https://www.veja-store.com/en_us/shoes"
    }

    This function loads all products by clicking the "Load More" button,
    then extracts product metadata (name, price, details_url) and uses
    extend_payload to trigger individual scrapes for each product's details.
    """
    await page.set_viewport_size({"width": 1280, "height": 800})
    params = EcommereceListParams(**params)
    if not params.category_url:
        raise ValueError("category_url is required in params")

    category_url = params.category_url
    category_name = params.category_name

    print(f"Scraping category: {category_name}")
    print(f"Category URL: {category_url}")

    # Navigate to the category page
    await find_entity(page, category_url)

    # Handle country/language modal if present
    await handle_modal(page)

    # Wait for product grid to load
    # Replace this selector with the appropriate one for your store
    await page.wait_for_selector(".product-grid")

    # Load all products by clicking "Load More" button
    await load_all_products(page)

    # Extract all products from the page
    all_products = await extract_products(page, category_url)

    print(f"Total products found: {len(all_products)}")

    # Enqueue each product for detailed scraping
    for product in all_products:
        extend_payload(
            {
                "api": "ecommerece-details",
                "parameters": dict(product),
            }
        )

    return {"category": category_name, "products": all_products}
