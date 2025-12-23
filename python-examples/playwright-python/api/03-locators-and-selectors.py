"""
Locators and Selectors

Demonstrates different ways to find elements:
- CSS selectors
- XPath selectors
- Built-in semantic locators (get_by_role, get_by_text, etc.)
- Chaining and filtering
"""

from playwright.async_api import Page
from typing import TypedDict


class Params(TypedDict):
    pass


async def automation(page: Page, params: Params | None = None, **_kwargs):
    await page.goto("https://books.toscrape.com/")
    await page.wait_for_load_state("networkidle")

    # CSS Selectors
    css_locator = page.locator(".product_pod h3 a")
    css_count = await css_locator.count()

    # XPath Selectors
    xpath_locator = page.locator("//article[@class='product_pod']//h3/a")
    xpath_count = await xpath_locator.count()

    # Built-in semantic locators
    # get_by_role - find by ARIA role
    next_button = page.get_by_role("link", name="next")
    has_next_button = await next_button.is_visible()

    # get_by_text - find by visible text
    travel_category = page.get_by_text("Travel", exact=True)
    has_travel_category = await travel_category.is_visible()

    # Chaining and filtering
    first_product = page.locator(".product_pod").first
    first_product_title = await first_product.locator("h3 a").get_attribute("title")

    # Using nth() to get specific element
    third_product = page.locator(".product_pod").nth(2)
    third_product_title = await third_product.locator("h3 a").get_attribute("title")

    # Filter locators
    in_stock_products = page.locator(".product_pod").filter(has=page.locator(".instock"))
    in_stock_count = await in_stock_products.count()

    return {
        "cssCount": css_count,
        "xpathCount": xpath_count,
        "hasNextButton": has_next_button,
        "hasTravelCategory": has_travel_category,
        "firstProductTitle": first_product_title,
        "thirdProductTitle": third_product_title,
        "inStockCount": in_stock_count,
    }
