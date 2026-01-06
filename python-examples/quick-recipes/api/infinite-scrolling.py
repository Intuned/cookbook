from playwright.async_api import Page
from intuned_browser import scroll_to_load_content
from typing import Any, Dict, List


async def extract_products(page: Page) -> List[Dict[str, str]]:
    """Extract products from the page."""
    results = []
    product_cards = page.locator(".product-item")
    count = await product_cards.count()

    for i in range(count):
        card = product_cards.nth(i)
        name = await card.locator(".product-name").text_content()
        price = await card.locator(".product-price").text_content()

        if name and price:
            results.append(
                {
                    "name": name.strip(),
                    "price": price.strip(),
                }
            )

    return results


async def automation(page: Page, params: Dict[str, Any] | None = None, **_kwargs):
    await page.goto("https://www.scrapingcourse.com/infinite-scrolling")

    max_scrolls = params.get("max_scrolls", 50) if params else 50

    # Scroll to load all content
    await scroll_to_load_content(
        source=page,
        max_scrolls=max_scrolls,
    )

    # Extract all products after content is loaded
    products = await extract_products(page)
    print(f"Extracted {len(products)} products")

    return products
