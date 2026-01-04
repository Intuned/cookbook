from typing import TypedDict

from intuned_browser import go_to_url
from playwright.async_api import Page


class Params(TypedDict):
    username: str
    password: str


async def create(page: Page, params: Params | None = None, **_kwargs):
    if params is None:
        raise ValueError("Params with username and password are required")

    # Step 1: Navigate to the login page
    # Wait for the page to fully load before proceeding
    await go_to_url(
        page=page,
        url="https://sandbox.intuned.dev/login",
    )

    # Step 2: Find the email input field and enter the username
    # The locator finds the element with id="email-input"
    email_input = page.locator("#email-input")
    await email_input.fill(params["username"])

    # Step 3: Find the password input field and enter the password
    # The locator finds the element with id="password-input"
    password_input = page.locator("#password-input")
    await password_input.fill(params["password"])

    # Step 4: Click the submit button to log in
    # This will submit the login form with the credentials we just entered
    submit_button = page.locator("#submit-button")
    await submit_button.click()

    # Step 5: Verify successful login by checking if the protected page is visible
    protected_page = page.locator("#book-consultations-title")
    is_logged_in = True
    try:
        await protected_page.wait_for(state="visible")
    except Exception:
        is_logged_in = False

    # Return True if login was successful, False otherwise
    return is_logged_in
