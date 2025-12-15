from playwright.async_api import Page, Locator


from typing import Union


async def fill_input(page: Page, target: Union[str, Locator], value: str):
    """
    Fill a text input.
    Accepts either a selector string or a Locator.
    """
    locator = target if isinstance(target, Locator) else page.locator(target)
    await locator.fill(value)


async def click_element(page: Page, selector: str):
    """Click an element"""
    await page.locator(selector).click(force=True)


async def check_input(page: Page, selector: str):
    """Check a checkbox or radio button"""
    input_el = page.locator(selector)
    if not await input_el.is_checked():
        await input_el.check(force=True)


async def uncheck_input(page: Page, selector: str):
    """Uncheck a checkbox"""
    input_el = page.locator(selector)
    if await input_el.is_checked():
        await input_el.uncheck()


async def select_option(page: Page, selector: str, value: str):
    """Select an option from a dropdown"""
    await page.locator(selector).select_option(value)


async def scroll_to_element(page: Page, selector: str):
    """Scroll until element is visible"""
    await page.locator(selector).scroll_into_view_if_needed()


async def scroll_to_bottom(page: Page):
    """Scroll to bottom of page"""
    await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
