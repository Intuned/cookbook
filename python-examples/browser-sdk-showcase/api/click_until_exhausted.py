from playwright.async_api import Page
from typing import TypedDict
from intuned_browser import click_until_exhausted
from intuned_browser import go_to_url

class Params(TypedDict):
        pass

async def automation(page: Page, params: Params | None = None, **_kwargs):
    await go_to_url(page, "https://careers.qualcomm.com/careers")
    button_locator = page.locator("xpath=//button[@class='btn btn-sm btn-secondary show-more-positions']")
    # Click until exhausted
    await click_until_exhausted(page=page, button_locator=button_locator, max_clicks=5)
    # Now all content is loaded and visible
    return "Success"