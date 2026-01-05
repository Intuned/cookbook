from intuned_browser import go_to_url
from playwright.async_api import Page


async def check(page: Page, **_kwargs) -> bool:
    # Step 1: Navigate to a protected page (dashboard)
    await go_to_url(
        page=page,
        url="https://sandbox.intuned.dev",
    )

    # Step 2: Check if the user menu toggle is visible
    # The user menu toggle should only be visible on the dashboard if we're logged in
    # If we were redirected to login, this element won't exist
    user_menu_toggle = page.locator("#user-menu-toggle")
    is_session_valid = await user_menu_toggle.is_visible()

    # Return True if the session is still valid (user menu is visible)
    # Return False if the session expired (we were redirected to login)
    return is_session_valid
