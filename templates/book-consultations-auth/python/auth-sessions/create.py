from playwright.async_api import Page
from typing import TypedDict


class Params(TypedDict):
    username: str
    password: str

async def create(page: Page, params: Params | None = None, **_kwargs):
    if params is None:
        raise ValueError("Params with username and password are required")
    
    # Step 1: Navigate to the login page
    # Wait for the page to fully load before proceeding
    await page.goto(
        "https://sandbox.intuned.dev/login",
        wait_until="networkidle",
        timeout=30_000
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
    
    # Step 5: Wait for the page to load after login
    # We wait for the network to be idle, indicating the page has finished loading
    await page.wait_for_load_state("networkidle")
    
    # Step 6: Verify successful login by checking if the user menu is visible
    # If the user menu toggle is visible, it means we successfully logged in
    user_menu_toggle = page.locator("#user-menu-toggle")
    is_logged_in = await user_menu_toggle.is_visible()
    
    # Step 7: Add a brief delay to ensure session is fully established
    # This helps prevent race conditions where the session might not be fully saved
    await page.wait_for_timeout(2000)
    
    # Return True if login was successful, False otherwise
    return is_logged_in