"""
Scrape List

Demonstrates extracting multiple items from a page:
- Using count() to get number of elements
- Using nth() to access specific elements in a loop
"""

from typing import TypedDict

from playwright.async_api import Page


class Params(TypedDict):
    limit: int


async def automation(page: Page, params: Params | None = None, **_kwargs):
    limit = params.get("limit", 10) if params else 10

    await page.goto("https://books.toscrape.com/")
    await page.wait_for_load_state("networkidle")

    products = page.locator(".product_pod")
    total_count = await products.count()

    # Limit to requested number
    scrape_count = min(limit, total_count)

    items = []
    for i in range(scrape_count):
        product = products.nth(i)

        # Get title from the link's title attribute
        title = await product.locator("h3 a").get_attribute("title")

        # Get price
        price = await product.locator(".price_color").text_content()

        # Get rating class (e.g., "star-rating Three")
        rating_class = await product.locator(".star-rating").get_attribute("class")
        rating = rating_class.replace("star-rating ", "") if rating_class else None

        # Check if in stock
        in_stock = await product.locator(".instock").count() > 0

        items.append(
            {
                "title": title,
                "price": price,
                "rating": rating,
                "inStock": in_stock,
            }
        )

    return {
        "totalAvailable": total_count,
        "scraped": len(items),
        "products": items,
    }
