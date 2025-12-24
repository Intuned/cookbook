# https://docs.intunedhq.com/automation-sdks/intuned-sdk/python/ai/functions/is_page_loaded
from typing import TypedDict
from playwright.async_api import Page
from intuned_browser.ai import is_page_loaded


class Params(TypedDict):
    pass


async def automation(page: Page, params: Params, **_kwargs):
    # Wait for page to finish loading
    await page.goto("https://sandbox.intuned.dev/")
    page_loaded = await is_page_loaded(page)
    if page_loaded:
        # Continue with scraping or interactions
        print("Page is loaded")
    else:
        # Wait longer or retry
        await page.wait_for_timeout(5000)
