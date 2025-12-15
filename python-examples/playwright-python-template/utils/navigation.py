# from playwright.async_api import Page
# from typing import TypedDict
# # from intuned_runtime import extend_payload
from intuned_browser import go_to_url

# class Params(TypedDict):
#     pass

from playwright.async_api import Page


async def playwright_navigate(page: Page, url: str) -> None:
    await page.goto(url)


async def intuned_navigate(page: Page, url: str) -> None:
    await go_to_url(page, url)
