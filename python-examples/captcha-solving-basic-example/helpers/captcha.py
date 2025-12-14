from intuned_runtime.captcha import wait_for_captcha_solve
from playwright.async_api import Page

@wait_for_captcha_solve(timeout_s=30, settle_period=10, wait_for_network_settled=True)
async def go_to_with_captcha_solve(page: Page, url: str):
    await page.goto(url)