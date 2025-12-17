from playwright.async_api import Page


async def check(page: Page, *args: ..., **kwargs: ...) -> ...:
    # Step 1: Navigate to a protected page (dashboard)
    # If the session is invalid, the website will typically redirect to the login page

    await page.goto("https://demo.openimis.org/front/home", timeout=30_000)

    # Step 2: Check if the user menu toggle is visible
    # The user menu toggle should only be visible on the dashboard if we're logged in
    # If we were redirected to login, this element won't exist
    user_menu_toggle = page.locator("h4.MuiTypography-h4")
    is_session_valid = await user_menu_toggle.is_visible()

    # Return True if the session is still valid (user menu is visible)
    # Return False if the session expired (we were redirected to login)
    return is_session_valid
