from playwright.async_api import Page
from typing import TypedDict
# from intuned_runtime import extend_payload


class Params(TypedDict):
    pages_to_navigate: int
    pass


async def automation(page: Page, params: Params | None = None, **_kwargs):
    """
    Navigate from the first page up to a specific page number.

    :param page: Playwright Page instance
    :param pages_to_navigate: Number of pages to navigate through
    """

    await page.goto("https://books.toscrape.com/index.html")
    await page.wait_for_load_state("networkidle")
    pages_to_navigate = params.get("pages_to_navigate")
    if not pages_to_navigate:
        raise RuntimeError("Number of Pages Must Be Provided")
    current_page = 1

    while current_page < pages_to_navigate:
        print(f"Currently on page {current_page}")

        next_button = page.locator("li.next a")

        # Stop if there is no "Next" button (last page reached)
        if await next_button.count() == 0 or not await next_button.is_visible():
            print("No more pages available.")
            break

        await next_button.click()
        await page.wait_for_load_state("networkidle")

        current_page += 1

    print(f"Stopped at page {current_page}")
