from playwright.async_api import Page
from typing import TypedDict
from intuned_browser import wait_for_network_settled
from intuned_browser import go_to_url

class Params(TypedDict):
    pass

@wait_for_network_settled
async def click_load_more(page: Page):
    await page.locator("xpath=//button[@class='btn btn-sm btn-secondary show-more-positions']").click()
    
async def automation(page: Page, params: Params | None = None, **_kwargs):
    await go_to_url(page, "https://careers.qualcomm.com/careers")
    await click_load_more(page) # Automatically waits for network to settle after clicking
    # Network has settled, data is loaded
    return "Success"