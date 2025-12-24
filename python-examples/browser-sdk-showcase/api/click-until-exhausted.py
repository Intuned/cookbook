# https://docs.intunedhq.com/automation-sdks/intuned-sdk/python/helpers/functions/extract_markdown
from typing import TypedDict
from playwright.async_api import Page
from intuned_browser import click_until_exhausted
class Params(TypedDict):
    pass
async def automation(page: Page, params: Params, **_kwargs):
    await page.goto("https://sandbox.intuned.dev/load-more")
    load_more_button = page.locator("main main button")  # Select the main button in the main content area.
    # Click until button disappears or is disabled
    await click_until_exhausted(
        page=page,
        button_locator=load_more_button,
        max_clicks=20
    )
    # Will keep clicking the button until the button disappears or is disabled or the max_clicks is reached.