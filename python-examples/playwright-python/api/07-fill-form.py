"""
Fill Form

Demonstrates form interactions:
- Text input fields
- Dropdown selects
- Checkboxes and radio buttons
"""

from playwright.async_api import Page
from typing import TypedDict


class Params(TypedDict):
    firstName: str
    lastName: str
    email: str


async def automation(page: Page, params: Params | None = None, **_kwargs):
    first_name = params.get("firstName", "John") if params else "John"

    # Using the-internet for reliable form demonstration
    await page.goto("https://the-internet.herokuapp.com/login")
    await page.wait_for_load_state("load")

    # Fill text inputs using different locator strategies
    # By ID
    await page.locator("#username").fill(first_name)

    # By name attribute
    await page.locator('input[name="password"]').fill("SuperSecretPassword!")

    # Get values before any action
    username_value = await page.locator("#username").input_value()

    # Click button using role
    await page.get_by_role("button", name="Login").click()

    # Wait for result
    await page.wait_for_load_state("networkidle")

    # Check if we got an error message (expected since credentials are fake)
    flash_message = await page.locator("#flash").text_content()

    # Navigate to dropdown page for select demonstration
    await page.goto("https://the-internet.herokuapp.com/dropdown")
    await page.wait_for_load_state("load")

    # Select dropdown option by value
    dropdown = page.locator("#dropdown")
    await dropdown.select_option("1")
    selected_value = await dropdown.input_value()

    # Select by label text
    await dropdown.select_option(label="Option 2")
    selected_label = await dropdown.input_value()

    # Navigate to checkboxes page
    await page.goto("https://the-internet.herokuapp.com/checkboxes")
    await page.wait_for_load_state("load")

    # Work with checkboxes
    checkboxes = page.locator('input[type="checkbox"]')

    # Check first checkbox if not checked
    first_checkbox = checkboxes.nth(0)
    if not await first_checkbox.is_checked():
        await first_checkbox.check()

    # Uncheck second checkbox if checked
    second_checkbox = checkboxes.nth(1)
    if await second_checkbox.is_checked():
        await second_checkbox.uncheck()

    checkbox1_checked = await first_checkbox.is_checked()
    checkbox2_checked = await second_checkbox.is_checked()

    return {
        "message": "Form interactions completed",
        "results": {
            "loginAttempt": {
                "username": username_value,
                "result": flash_message.strip() if flash_message else None,
            },
            "dropdown": {
                "selectedByValue": selected_value,
                "selectedByLabel": selected_label,
            },
            "checkboxes": {
                "first": checkbox1_checked,
                "second": checkbox2_checked,
            },
        },
    }
