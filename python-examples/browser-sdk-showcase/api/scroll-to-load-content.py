# https://docs.intunedhq.com/automation-sdks/intuned-sdk/python/helpers/functions/scroll_to_load_content
from typing import TypedDict

from intuned_browser import go_to_url, scroll_to_load_content
from intuned_runtime import extend_timeout
from playwright.async_api import Page


class Params(TypedDict):
    extend_timeout_on_scroll: bool
    max_scrolls: int


async def automation(page: Page, params: Params, **_kwargs):
    extend_timeout_on_scroll = params.get("extend_timeout_on_scroll", False)
    max_scrolls = params.get("max_scrolls", 10)
    await go_to_url(page, "https://sandbox.intuned.dev/infinite-scroll")
    # Scroll through entire page content
    # This will handle infinite scrolls by scrolling the page continuously, and when max_scrolls is reached, it will stop and the data items will be loaded.
    # Read about extend_timeout: https://docs.intunedhq.com/docs/05-references/runtime-sdk-python/extend-timeout
    await scroll_to_load_content(
        source=page,
        on_scroll_progress=extend_timeout if extend_timeout_on_scroll else lambda: None,
        max_scrolls=max_scrolls,
    )
    # Will keep scrolling until the page has loaded all content or the max_scrolls is reached.
    elements = await page.locator("main slot slot slot div").count() 
    

    return {
        "number_of_elements": elements,
    }
