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
    await go_to_url(
        page=page,
        url="https://www.scrapingcourse.com/login",
    )

    # Step 2: Find the email input field and enter the username
    # The locator finds the element with id="email"
    email_input = page.locator("#email")
    await email_input.fill(params["username"])

    # Step 3: Find the password input field and enter the password
    # The locator finds the element with id="password"
    password_input = page.locator("#password")
    await password_input.fill(params["password"])

    # Step 4: Click the submit button to log in
    # This will submit the login form with the credentials we just entered
    submit_button = page.locator("#submit-button")
    await submit_button.click()

    # Step 5: Verify successful login by checking if the products grid is visible
    # If the products grid is not visible, wait_for will raise an exception
    products_grid = page.locator("#product-grid")
    await products_grid.wait_for(state="visible", timeout=10_000)
