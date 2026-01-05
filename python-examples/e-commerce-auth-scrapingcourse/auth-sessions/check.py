from intuned_browser import go_to_url
from playwright.async_api import Page


async def check(page: Page, **_kwargs) -> bool:
    # Step 1: Navigate to a protected page (dashboard)
    await go_to_url(
        page=page,
        url="https://www.scrapingcourse.com/dashboard",
    )

    # Step 2: Check if the products grid is visible
    # The products grid should only be visible on the dashboard if we're logged in
    # If we were redirected to login, this element won't exist
    products_grid = page.locator("#product-grid")
    is_session_valid = await products_grid.is_visible()

    # Return True if the session is still valid (products grid is visible)
    # Return False if the session expired (we were redirected to login)
    return is_session_valid
