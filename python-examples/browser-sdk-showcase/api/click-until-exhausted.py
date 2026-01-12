# https://docs.intunedhq.com/automation-sdks/intuned-sdk/python/helpers/functions/extract_markdown
from typing import TypedDict

from intuned_browser import click_until_exhausted
from playwright.async_api import Page


class Params(TypedDict):
    pass


async def automation(page: Page, params: Params, **_kwargs):
    await page.goto("https://sandbox.intuned.dev/load-more")
    load_more_button = page.locator(
        "main main button"
    )  # Select the main button in the main content area.
    # Click until button disappears or is disabled
    await click_until_exhausted(
        page=page, button_locator=load_more_button, max_clicks=20
    )
    # Will keep clicking the button until the button disappears or is disabled or the max_clicks is reached.
    elements = await page.locator("main main slot slot div").count()
    return {
        "number_of_elements": elements,
    }
