"""
Wait Strategies

Demonstrates different waiting mechanisms:
- Playwright: wait_for_load_state, wait_for_selector
- Intuned SDK: wait_for_dom_settled, wait_for_network_settled (decorators)
"""

from typing import TypedDict

from intuned_browser import wait_for_dom_settled, wait_for_network_settled
from playwright.async_api import Page


class Params(TypedDict):
    pass


# Intuned SDK provides decorators for wait strategies
# wait_for_network_settled - waits for network to settle after the action
@wait_for_network_settled
async def click_category(page: Page):
    """Click on a category link and wait for network to settle."""
    await page.locator('a[href*="travel"]').click()


# wait_for_dom_settled - waits for DOM to stop changing after the action
@wait_for_dom_settled
async def scroll_page(page: Page):
    """Scroll and wait for any dynamic content to settle."""
    await page.evaluate("window.scrollTo(0, 500)")


async def automation(page: Page, params: Params | None = None, **_kwargs):
    await page.goto("https://books.toscrape.com/")

    # ============================================
    # Playwright built-in wait strategies
    # ============================================

    # Wait for different load states
    # "networkidle" - wait until there are no network connections for 500ms
    await page.wait_for_load_state("networkidle")

    # Wait for specific element to appear
    await page.wait_for_selector(".product_pod h3 a", state="visible", timeout=5000)

    # Wait for an element to disappear (useful for loading spinners)
    # await page.wait_for_selector(".loading-spinner", state="hidden")

    # Count products after waiting
    product_count = await page.locator(".product_pod").count()

    # ============================================
    # Intuned SDK wait helpers (decorators)
    # ============================================

    # Use the decorated function - automatically waits for DOM to settle
    await scroll_page(page)

    # Use the decorated function - automatically waits for network to settle
    await click_category(page)

    # Verify we navigated to the category page
    category_title = await page.locator(".page-header h1").text_content()

    return {
        "message": "All wait strategies demonstrated successfully",
        "productCount": product_count,
        "categoryTitle": category_title.strip() if category_title else None,
    }
