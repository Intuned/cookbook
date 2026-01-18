from intuned_runtime.captcha import wait_for_captcha_solve
from playwright.async_api import Page


@wait_for_captcha_solve(timeout_s=30, settle_period=10, wait_for_network_settled=True)
async def go_to_with_captcha_solve(page: Page, url: str):
    """Navigate to URL with automatic captcha solving.
    
    Uses wait_for_captcha_solve as a decorator - it wraps the navigation
    and automatically waits for any captcha to resolve after the page loads. 
    Check our [CAPTCHA Helpers reference](https://docs.intunedhq.com/docs/05-references/runtime-sdk-python/captcha-helpers#wait-for-captcha-solve) for more info
    
    For manual control, use wait_for_captcha_solve as an awaitable instead:
        await page.goto(url)
        await wait_for_captcha_solve(page, timeout_s=30, settle_period=10)
    """
    await page.goto(url)
