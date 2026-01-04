# https://docs.intunedhq.com/automation-sdks/intuned-sdk/python/helpers/functions/wait_for_network_settled
from typing import TypedDict

from intuned_browser import wait_for_network_settled
from playwright.async_api import Page


# Decorator without arguments (uses timeout_s=30, max_inflight_requests=0)
@wait_for_network_settled
async def click_load_more(page):
    await page.locator("main main button").click()


class Params(TypedDict):
    pass


async def automation(page: Page, params: Params, **_kwargs):
    await page.goto("https://sandbox.intuned.dev/load-more")
    # Automatically waits for network to settle after clicking
    await click_load_more(page)
    # Network has settled, data is loaded
