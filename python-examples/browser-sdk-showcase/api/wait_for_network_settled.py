from playwright.async_api import Page
from typing import TypedDict
from intuned_browser import wait_for_network_settled
from intuned_browser import go_to_url

class Params(TypedDict):
    timeout: float | None
    max_inflight_requests: int | None
    pass

async def automation(page: Page, params: Params | None = None, **_kwargs):
    await go_to_url(page, "https://careers.qualcomm.com/careers")
    timeout = params.get("timeout", 30)
    max_inflight_requests = params.get("max_inflight_requests", 0)
    @wait_for_network_settled(timeout_s=timeout, max_inflight_requests=max_inflight_requests)
    async def click_load_more(page):
        await page.locator("xpath=//button[@class='btn btn-sm btn-secondary show-more-positions']").click()
    # Automatically waits for network to settle after clicking
    await click_load_more(page)
    # Network has settled, data is loaded
    return "Success"