# https://docs.intunedhq.com/automation-sdks/intuned-sdk/python/helpers/functions/wait_for_dom_settled
from typing import TypedDict
from playwright.async_api import Page
from intuned_browser import wait_for_dom_settled


# Decorator without arguments (uses settle_duration=0.5, timeout_s=30.0)
@wait_for_dom_settled
async def load_more_content(page):
    await page.locator("main main button").click()


class Params(TypedDict):
    pass


async def automation(page: Page, params: Params, **_kwargs):
    await page.goto("https://sandbox.intuned.dev/load-more")
    # Automatically waits for DOM to settle after clicking
    await load_more_content(page)
    # DOM has settled, new content is loaded
