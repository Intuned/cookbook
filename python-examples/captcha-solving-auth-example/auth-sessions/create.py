from typing import TypedDict

from intuned_runtime.captcha import wait_for_captcha_solve
from playwright.async_api import Page


class Params(TypedDict):
    email: str
    password: str


async def create(page: Page, params: Params | None = None, **_kwargs):
    if params is None:
        raise ValueError("Params with email and password are required")
    
    await page.goto("https://www.scrapingcourse.com/login/cf-turnstile")
    await page.locator("#email").fill(params["email"])
    await page.locator("#password").fill(params["password"])
    await wait_for_captcha_solve(page, timeout_s=30, settle_period=10)
    await page.locator("#submit-button").click()
    # Verify successful login by checking if Logout button is visible
    # If the Logout button is not visible, wait_for will raise an exception
    await page.get_by_text("Logout").wait_for(state="visible", timeout=10_000)
