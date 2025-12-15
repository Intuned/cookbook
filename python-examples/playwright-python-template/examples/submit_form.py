from playwright.async_api import Page, Locator
from utils.navigation import playwright_navigate, intuned_navigate
from utils.locators import by_role, is_visible, count, by_placeholder
from utils.scrapping import get_text
from utils.auto_waiting import wait_for_network_idle, wait_for_selector
from utils.interactions import fill_input, check_input, click_element


async def submit_form(page: Page, url: str):
    await intuned_navigate(page, url)
    await wait_for_network_idle(page)
    form_locator = page.locator("form#userForm")
    if await is_visible(form_locator):
        # fill mandatory data
        first_name_locator = await by_placeholder(page, "First Name")
        await fill_input(page, first_name_locator, "Example")
        last_name_locator = await by_placeholder(page, "Last Name")
        await fill_input(page, last_name_locator, "Example")
        moblie_number_locator = await by_placeholder(page, "Mobile Number")
        await fill_input(page, moblie_number_locator, "0123456789")

        await check_input(
            page,
            "input#gender-radio-1",
        )
        # Click on submit button
        await click_element(page, "button#submit")
        # Check if form is submitted by waiting for Thanks for submitting text to appear
        await wait_for_selector(page, "div#example-modal-sizes-title-lg", "visible")
        # Return true if the form is sumbittd
        is_submitted = await is_visible(
            page.locator("div#example-modal-sizes-title-lg")
        )

        if is_submitted:
            return True

    return False
