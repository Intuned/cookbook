"""
Scrape Single Value

Demonstrates extracting individual values from a page:
- text_content() for text
- get_attribute() for attributes
- is_visible() for checking visibility
"""

from typing import TypedDict

from playwright.async_api import Page


class Params(TypedDict):
    pass


async def automation(page: Page, params: Params | None = None, **_kwargs):
    await page.goto(
        "https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html"
    )
    await page.wait_for_load_state("networkidle")

    # Get text content
    title = await page.locator(".product_main h1").text_content()

    # Get price
    price = await page.locator(".price_color").first.text_content()

    # Get attribute value
    image_url = await page.locator(".item.active img").get_attribute("src")

    # Get product description (first paragraph after the description header)
    description = await page.locator("#product_description ~ p").text_content()

    # Check element visibility - verify breadcrumb is visible
    breadcrumb_visible = await page.locator(".breadcrumb").is_visible()

    # Get availability text
    stock_info = await page.locator(".availability").text_content()

    return {
        "title": title,
        "price": price,
        "imageUrl": image_url,
        "description": description[:100] + "..."
        if description and len(description) > 100
        else description,
        "breadcrumbVisible": breadcrumb_visible,
        "stockInfo": stock_info.strip() if stock_info else None,
    }
