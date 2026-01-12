# https://docs.intunedhq.com/automation-sdks/intuned-sdk/python/helpers/functions/go_to_url
from typing import TypedDict

from intuned_browser import go_to_url
from playwright.async_api import Page


class Params(TypedDict):
    timeout: int
    retries: int


async def automation(page: Page, params: Params, **_kwargs):
    timeout = params.get("timeout", 15)
    retries = params.get("retries", 3)

    # Navigate to the URL with enhanced reliability and automatic retries.
    # This will wait for the networkidle state more reliably than the default playwright behavior.
    # When wait_for_load_using_ai=True, the function uses is_page_loaded under the hood to determine
    await go_to_url(
        page,
        url="https://books.toscrape.com",
        timeout_s=timeout,
        retries=retries,
        wait_for_load_using_ai=True,
        # Since we are not passing the api_key, the function will use the Intuned AI Gateway.
    )

    # Start your automation here, the page is already loaded and ready to use.
    title = await page.title()
    url = page.url

    return {
        "title": title,
        "url": url,
    }
