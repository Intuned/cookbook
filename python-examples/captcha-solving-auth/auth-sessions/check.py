
from playwright.async_api import Page


async def check(page: Page, *args: ..., **kwargs: ...) -> ...:
    await page.goto("https://www.scrapingcourse.com/dashboard")
    return await page.get_by_text("Logout").is_visible()
