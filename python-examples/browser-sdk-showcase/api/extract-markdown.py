# https://docs.intunedhq.com/automation-sdks/intuned-sdk/python/helpers/functions/extract_markdown
from playwright.async_api import Page
from typing import TypedDict
from intuned_browser import extract_markdown
# from intuned_runtime import extend_payload


class Params(TypedDict):
    pass


async def automation(page: Page, params: Params | None = None, **_kwargs):
    await page.goto("https://books.toscrape.com")
    header_locator = page.locator('h1')
    markdown = await extract_markdown(header_locator) # Extract markdown from the header locator.
    print("Markdown content of the header:")
    print(markdown)
    return markdown