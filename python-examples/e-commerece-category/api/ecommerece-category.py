from playwright.async_api import Page, BrowserContext
from intuned_browser import go_to_url
from typing import List
from runtime_helpers import extend_payload
from urllib.parse import urlparse, urljoin
from utils.types_and_schemas import EcommereceCategoryParams, Category


async def handle_cookies(page: Page) -> None:
    """
    Handles cookie consent banner if present.
    Replace the selector with the appropriate one for your store.
    """
    try:
        # Replace selector with appropriate one for your store
        await page.wait_for_selector("#onetrust-accept-btn-handler", timeout=5000)
        await page.click("#onetrust-accept-btn-handler")
        print("Accepted cookies")
        await page.wait_for_timeout(1000)
    except Exception:
        pass


async def extract_categories(page: Page, store_url: str) -> List[Category]:
    """
    Extracts category links from the main menu.
    Replace selectors with appropriate ones for your store.
    """
    categories: List[Category] = []

    # Replace selector with appropriate one for your store's menu
    menu_selector = ".has-submenu a.main-menu__link"
    links = await page.query_selector_all(menu_selector)

    for link in links:
        href = await link.get_attribute("href")
        name = await link.inner_text()

        if href:
            # Make sure href is absolute URL
            category_url = urljoin(store_url, href)
            category_name = name.strip() if name else ""

            categories.append(
                {
                    "category_name": category_name,
                    "category_url": category_url,
                }
            )

    return categories


async def automation(
    page: Page,
    params: EcommereceCategoryParams,
    context: BrowserContext | None = None,
    **_kwargs,
):
    """
    Scrapes all category links from an e-commerce store's main menu.
    Each category will be scraped separately using the extend_payload mechanism.

    Example params:
    {
        "store_url": "https://www.example-store.com/"
    }

    This function collects category metadata (name, url) from the main menu
    and then uses extend_payload to trigger individual scrapes for each category's products.
    """
    await page.set_viewport_size({"width": 1280, "height": 800})
    params = EcommereceCategoryParams(**params)
    if not params.store_url:
        raise ValueError("store_url is required in params")

    store_url = params.store_url.rstrip("/")

    # Parse and validate the store URL
    parsed_url = urlparse(store_url)
    if not parsed_url.scheme or not parsed_url.netloc:
        raise ValueError(f"Invalid store URL: {store_url}")

    print(f"Scraping categories from: {store_url}")

    # Navigate to the store home page
    await go_to_url(page, store_url)

    # Handle cookie consent banner
    await handle_cookies(page)

    # Wait for the main menu to be present
    # Replace selector with appropriate one for your store
    await page.wait_for_selector(".has-submenu a.main-menu__link")

    # Extract all categories from the menu
    all_categories = await extract_categories(page, store_url)

    print(f"Total categories found: {len(all_categories)}")

    # Enqueue each category for further scraping
    for category in all_categories:
        extend_payload(
            {
                "api": "ecommerece-list",
                "parameters": dict(category),
            }
        )

    return {"categories": all_categories}
