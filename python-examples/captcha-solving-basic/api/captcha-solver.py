from typing import TypedDict

from helpers.captcha import go_to_with_captcha_solve
from intuned_runtime.captcha import wait_for_captcha_solve
from playwright.async_api import Page


class Params(TypedDict):
    pass


async def cloudflare_challenge(page: Page, params: Params | None = None, **_kwargs):
    """Solve Cloudflare challenge captcha with callable pattern.
    
    Demonstrates manually awaiting wait_for_captcha_solve after navigation for fine-grained control.
    Check our [CAPTCHA Helpers reference](https://docs.intunedhq.com/docs/05-references/runtime-sdk-python/captcha-helpers#wait-for-captcha-solve) for more info

    Configuration (Intuned.json):
        captchaSolver.enabled: true
        captchaSolver.cloudflare.enabled: true
        captchaSolver.settings: { autoSolve, maxRetries }
    """
    await page.goto("https://2captcha.com/demo/cloudflare-turnstile-challenge")
    await wait_for_captcha_solve(page, timeout_s=30, settle_period=10)
    return {}


async def cloudflare_turnstile(page: Page, params: Params | None = None, **_kwargs):
    """Solve Cloudflare Turnstile captcha with decorator pattern

    Configuration (Intuned.json):
        captchaSolver.enabled: true
        captchaSolver.cloudflare.enabled: true
        captchaSolver.settings: { autoSolve, maxRetries }
    """
    await go_to_with_captcha_solve(page, "https://2captcha.com/demo/cloudflare-turnstile")
    return {}


async def custom_captcha(page: Page, params: Params | None = None, **_kwargs):
    """Solve custom captcha

    Configuration (Intuned.json):
        captchaSolver.enabled: true
        captchaSolver.customCaptcha.enabled: true
        captchaSolver.settings: { autoSolve, maxRetries }
    """
    await go_to_with_captcha_solve(page, "https://captcha.com/demos/features/captcha-demo.aspx")
    return {}


async def geetest(page: Page, params: Params | None = None, **_kwargs):
    """Solve GeeTest captcha

    Configuration (Intuned.json):
        captchaSolver.enabled: true
        captchaSolver.geetest.enabled: true
        captchaSolver.settings: { autoSolve, maxRetries }
    """
    await go_to_with_captcha_solve(page, "https://test.cap.guru/demo/geetest#geetest2")
    return {}


async def recaptcha(page: Page, params: Params | None = None, **_kwargs):
    """Solve reCAPTCHA v2 Enterprise

    Configuration (Intuned.json):
        captchaSolver.enabled: true
        captchaSolver.googleRecaptchaV2.enabled: true
        captchaSolver.settings: { autoSolve, maxRetries }
    """
    await go_to_with_captcha_solve(page, url="https://2captcha.com/demo/recaptcha-v2-enterprise")
    return {}


async def automation(page: Page, params: Params | None = None, **_kwargs):
    """Automation wrapper that calls all captcha solvers with 5 second intervals

    Configuration (Intuned.json):
        Core settings:
            captchaSolver.enabled: true
            captchaSolver.settings: { autoSolve, maxRetries }

        Individual solver settings:
            captchaSolver.customCaptcha.enabled: true
            captchaSolver.geetest.enabled: true
            captchaSolver.googleRecaptchaV2.enabled: true
            captchaSolver.cloudflare.enabled: true
    """
    await custom_captcha(page, params)
    await page.wait_for_timeout(5000)

    await geetest(page, params)
    await page.wait_for_timeout(5000)

    await recaptcha(page, params)
    await page.wait_for_timeout(5000)

    await cloudflare_challenge(page, params)
    await page.wait_for_timeout(5000)

    await cloudflare_turnstile(page, params)
    return {}
