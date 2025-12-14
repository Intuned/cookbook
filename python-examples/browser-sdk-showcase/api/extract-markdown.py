from playwright.async_api import Page
from typing import TypedDict
from intuned_browser import filter_empty_values
# from intuned_runtime import extend_payload


class Params(TypedDict):
    pass


async def automation(page: Page, params: Params | None = None, **_kwargs):
    await page.goto("https://books.toscrape.com")
    header_locator = page.locator('h1')
    markdown = await filter_empty_values(header_locator)
    print(markdown) 
    return markdown