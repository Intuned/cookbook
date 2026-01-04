from typing import TypedDict

from playwright.async_api import Page


class Params(TypedDict):
    username: str
    password: str


async def create(page: Page, params: Params | None = None, **_kwargs):
    if params is None:
        raise ValueError("Params with username and password are required")

    # Step 1: Navigate to the login page
    # Wait for the page to fully load before proceeding
    await page.goto(
        "https://demo.openimis.org/front/login",
        wait_until="networkidle",
        timeout=30_000,
    )

    # Step 2: Find the username  input field and enter the username
    username_input = page.locator("input[type='text']")
    await username_input.fill(params["username"])

    # Step 3: Find the password input field and enter the password
    password_input = page.locator("input[type='password']")
    await password_input.fill(params["password"])

    # Step 4: Click the submit button to log in
    # This will submit the login form with the credentials we just entered
    submit_button = page.locator("button[type=submit]")
    await submit_button.click()

    # Step 5: Wait for the page to load after login
    # We wait for the network to be idle, indicating the page has finished loading
    await page.wait_for_load_state("networkidle")

    # Step 6: Verify successful login by checking the Welcome Message
    # If the user menu toggle is not visible, wait_for will raise an exception
    user_menu_toggle = page.locator("h4.MuiTypography-h4")
    await user_menu_toggle.wait_for(state="visible", timeout=10_000)

    # Step 7: Add a brief delay to ensure session is fully established
    # This helps prevent race conditions where the session might not be fully saved
    await page.wait_for_timeout(2000)
