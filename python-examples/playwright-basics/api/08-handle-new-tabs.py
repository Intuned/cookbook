"""
Handle New Tabs and Popups

Demonstrates handling pages that open in new tabs:
- Capturing new pages with expect_page()
- Handling popups
- Working with multiple pages
"""

from typing import TypedDict

from playwright.async_api import Page

from intuned_browser import go_to_url, wait_for_dom_settled


class Params(TypedDict):
    pass


async def automation(page: Page, params: Params | None = None, **_kwargs):
    await go_to_url(page, url="https://books.toscrape.com/")
    await wait_for_dom_settled(source=page)

    # Get the first book link
    first_book_link = page.locator(".product_pod h3 a").first
    book_title = await first_book_link.get_attribute("title")

    # Method 1: Navigate in the same page
    await first_book_link.click()
    await wait_for_dom_settled(source=page)
    book_price = await page.locator(".price_color").first.text_content()

    # Go back to the list using direct navigation (more reliable than page.go_back())
    await go_to_url(page, url="https://books.toscrape.com/")
    await wait_for_dom_settled(source=page)

    # Method 2: Open in a new page (simulating target="_blank")
    # Create a new page manually from context
    context = page.context
    new_page = await context.new_page()
    await go_to_url(
        new_page,
        url="https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html",
    )
    await wait_for_dom_settled(source=new_page)

    new_page_title = await new_page.locator(".product_main h1").text_content()
    new_page_price = await new_page.locator(".price_color").first.text_content()

    # Close the new page when done
    await new_page.close()

    # Method 3: Handle links that open new tabs
    # When a click triggers a new tab, capture it with expect_page()
    # Example (commented as books.toscrape doesn't have target="_blank" links):
    # async with page.context.expect_page() as new_page_info:
    #     await page.locator("a[target='_blank']").click()
    # popup = await new_page_info.value
    # await popup.wait_for_load_state("domcontentloaded")
    # popup_title = await popup.title()
    # await popup.close()

    return {
        "originalPage": {
            "title": book_title,
            "price": book_price,
        },
        "newPage": {
            "title": new_page_title.strip() if new_page_title else None,
            "price": new_page_price,
        },
    }
