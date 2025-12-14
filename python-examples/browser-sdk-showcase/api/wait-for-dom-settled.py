from playwright.async_api import Page
from typing import TypedDict
from intuned_browser import wait_for_dom_settled
from intuned_browser import go_to_url

class Params(TypedDict):
    settle_duration: float | None
    timeout_s: float | None

async def automation(page: Page, params: Params | None = None, **_kwargs):
    settle_duration = params.get("settle_duration", 0.5)
    timeout_s = params.get("timeout_s", 30.0)
    await go_to_url(page, "https://careers.qualcomm.com/careers")
    @wait_for_dom_settled(settle_duration=settle_duration, timeout_s=timeout_s)
    async def load_more_content(page):
        await page.locator("xpath=//button[@class='btn btn-sm btn-secondary show-more-positions']").click()
    # Automatically waits for DOM to settle after clicking
    await load_more_content(page)
    # DOM has settled, new content is loaded
    return "Success"