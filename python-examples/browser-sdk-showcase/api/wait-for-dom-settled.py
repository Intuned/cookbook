from playwright.async_api import Page
from typing import TypedDict
from intuned_browser import wait_for_dom_settled
from intuned_browser import go_to_url

class Params(TypedDict):
    pass

@wait_for_dom_settled
async def load_more_content(page):
    await page.locator("xpath=//button[@class='btn btn-sm btn-secondary show-more-positions']").click()
async def automation(page: Page, params: Params | None = None, **_kwargs):
    await go_to_url(page, "https://careers.qualcomm.com/careers")
    # Automatically waits for DOM to settle after clicking
    await load_more_content(page)
    # DOM has settled, new content is loaded
    return "Success"