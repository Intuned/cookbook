from playwright.async_api import Page, Locator
from typing import Union, Literal


async def wait_for_dom_content_loaded(page: Page, timeout: int = 30_000) -> None:
    """
    Waits until the DOMContentLoaded event is fired.
    Useful when you only need the HTML to be parsed.
    """
    await page.wait_for_load_state(
        state="domcontentloaded",
        timeout=timeout,
    )


async def wait_for_page_load(page: Page, timeout: int = 30_000) -> None:
    """
    Waits until the page load event is fired.
    This includes static resources like images and stylesheets.
    """
    await page.wait_for_load_state(
        state="load",
        timeout=timeout,
    )


async def wait_for_network_idle(page: Page, timeout: int = 30_000) -> None:
    """
    Waits until there are no active network requests.
    Best for modern, dynamic applications.
    """
    await page.wait_for_load_state(
        state="networkidle",
    )


async def wait_for_selector(
    page: Page,
    target: Union[str, Locator],
    state: Literal["attached", "visible", "hidden", "detached"] = "visible",
    timeout: int = 30_000,
):
    """
    Wait for an element to reach a specific state.

    - target: selector string or Locator
    - state: attached | visible | hidden | detached
    - timeout: max wait time in milliseconds
    """
    if isinstance(target, Locator):
        await target.wait_for(state=state, timeout=timeout)
    else:
        await page.wait_for_selector(target, state=state, timeout=timeout)
