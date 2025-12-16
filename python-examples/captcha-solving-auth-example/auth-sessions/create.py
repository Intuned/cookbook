from playwright.async_api import Page
from typing import TypedDict
from intuned_runtime.captcha import wait_for_captcha_solve


class Params(TypedDict):
    email: str
    password: str


async def create(page: Page, params: Params | None = None, **_kwargs):
    await page.goto("https://www.scrapingcourse.com/login/cf-turnstile")
    await page.locator("#email").fill(params.get("email"))
    await page.locator("#password").fill(params.get("password"))
    await wait_for_captcha_solve(page, timeout_s=30, settle_period=10)
    await page.locator("#submit-button").click()
    await page.get_by_text("Logout").is_visible()
    return True
