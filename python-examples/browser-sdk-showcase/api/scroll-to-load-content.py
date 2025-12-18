from playwright.async_api import Page
from typing import TypedDict
from intuned_browser import scroll_to_load_content
from intuned_runtime import extend_timeout
from intuned_browser import go_to_url

class Params(TypedDict):
    extend_timeout_on_scroll: bool | None  
    max_scrolls: int | None

async def automation(page: Page, params: Params | None = None, **_kwargs):
    extend_timeout_on_scroll = params.get("extend_timeout_on_scroll", False)
    max_scrolls = params.get("max_scrolls", 10)
    await go_to_url(page, "https://www.ycombinator.com/companies")
    # Scroll through entire page content
    # This will handle infinite scrolls by scrolling the page continuously, and when max_scrolls is reached, it will stop and the data items will be loaded.
    await scroll_to_load_content(source=page, on_scroll_progress=extend_timeout if extend_timeout_on_scroll else lambda: None, max_scrolls = max_scrolls)
    # Now all content is loaded and visible
    return "Success"