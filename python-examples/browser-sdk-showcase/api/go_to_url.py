from playwright.async_api import Page
from typing import TypedDict
from intuned_browser import go_to_url
# from intuned_runtime import extend_payload


class Params(TypedDict):
    wait_for_load_using_ai: bool | None
    timeout: int | None
    retries: int | None
    


async def automation(page: Page, params: Params | None = None, **_kwargs):
    wait_for_load_using_ai = params.get("wait_for_load_using_ai", False) #  You must provide an API Key in the environment variables for this to work. Or use Intuned's Gateway.
    timeout = params.get("timeout", 15)
    retries = params.get("retries", 3)
    await go_to_url(page, "https://books.toscrape.com", wait_for_load_using_ai=wait_for_load_using_ai, timeout_s=timeout, retries=retries)
    # Start your automation here, the page is already loaded and ready to use.
    return "Success"