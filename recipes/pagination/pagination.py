from playwright.async_api import Page, BrowserContext
from dataclasses import dataclass


@dataclass
class Product:
    name: str
    price: str


async def extract_data_from_current_page(page: Page) -> list[Product]:
    results = []
    product_cards = page.locator(".product-item")
    count = await product_cards.count()

    for i in range(count):
        card = product_cards.nth(i)
        name = await card.locator(".product-name").text_content()
        price = await card.locator(".product-price").text_content()

        if name and price:
            results.append(Product(name=name.strip(), price=price.strip()))

    return results


async def has_next_page(page: Page) -> bool:
    next_button = page.locator('a:has-text("Next page")')
    return await next_button.count() > 0


async def go_to_next_page(page: Page) -> None:
    next_button = page.locator('a:has-text("Next page")')
    await next_button.click()
    await page.wait_for_load_state("networkidle")


async def handler(params: dict, page: Page, context: BrowserContext):
    max_pages = params.get("maxPages", 5)
    await page.goto("https://www.scrapingcourse.com/pagination")

    all_products = []
    current_page = 0

    while current_page < max_pages:
        # Extract data from current page
        results = await extract_data_from_current_page(page)
        print(f"Extracted {len(results)} results from page {current_page + 1}")
        all_products.extend(results)

        # Check if there's a next page
        can_continue = await has_next_page(page)
        if not can_continue:
            print("No more pages available.")
            break

        current_page += 1
        if current_page >= max_pages:
            break

        # Navigate to next page
        await go_to_next_page(page)

    return all_products

