from playwright.async_api import Page, Locator
from typing import Any, Dict, List


async def click_until_exhausted(button_locator: Locator, max_clicks: int) -> None:
    """Click button until it disappears or max clicks reached."""
    clicks = 0

    while clicks < max_clicks:
        is_visible = await button_locator.is_visible()
        if not is_visible:
            break

        await button_locator.click()
        clicks += 1


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
    await page.goto("https://www.scrapingcourse.com/button-click")

    max_clicks = params.get("max_clicks", 50) if params else 50

    # Locate the "Load More" button
    load_more_button = page.locator("button:has-text('Load More')")

    # Click until button disappears or max clicks reached
    await click_until_exhausted(load_more_button, max_clicks)

    # Extract all products after content is loaded
    products = await extract_products(page)
    print(f"Extracted {len(products)} products")

    return products
