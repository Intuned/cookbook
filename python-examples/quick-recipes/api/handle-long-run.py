import asyncio
from intuned_runtime import extend_timeout
from playwright.async_api import Page, BrowserContext
from typing import Any, Dict, List

async def automation(page: Page, params: Dict[str, Any] = None, **_kwargs):
    all_books = []
    max_pages = params.get("max_pages", 50) if params else 50
    current_page = 1

    await page.goto("https://books.toscrape.com/")

    while current_page <= max_pages:
        print(f"Processing page {current_page} of {max_pages}...")

        # Extract books from current page
        book_elements = page.locator("article.product_pod")
        count = await book_elements.count()

        for i in range(count):
            book = book_elements.nth(i)
            title = await book.locator("h3 a").get_attribute("title")
            price = await book.locator(".price_color").text_content()
            book_url = await book.locator("h3 a").get_attribute("href")

            if title and price and book_url:
                all_books.append({
                    "title": title,
                    "price": price.strip(),
                    "url": f"https://books.toscrape.com/{book_url}",
                })

        print(f"Completed page {current_page}. Books collected: {len(all_books)}")

        # Extend timeout after completing this unit of work
        extend_timeout()

        # Check if there's a next page
        next_button = page.locator(".next a")
        has_next = await next_button.count() > 0

        if not has_next or current_page >= max_pages:
            break

        # Add delay between page requests to respect rate limits
        await asyncio.sleep(10)

        # Navigate to next page
        await next_button.click()
        await page.wait_for_load_state("networkidle")

        current_page += 1

    print(f"Total books collected: {len(all_books)}")
    return all_books