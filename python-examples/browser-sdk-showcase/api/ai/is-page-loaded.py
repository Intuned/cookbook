from playwright.async_api import Page
from typing import TypedDict
from intuned_browser.ai import is_page_loaded

    
class Params(TypedDict):
        pass

async def automation(page: Page, params: Params | None = None, **_kwargs):
    # Wait for page to finish loading
    await page.goto('https://www.booking.com/')
    page_loaded = await is_page_loaded(page) # Use AI vision to determine if the page has finished loading.
    # At this point, the AI has determined if the page has finished loading based on a screenshot taken of the page.
    if page_loaded:
        # Continue with scraping or interactions
        print("Page is fully loaded")
    else:
        # Wait longer or retry
        print("Page is still loading")
    return "Done"