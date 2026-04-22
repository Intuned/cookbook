"""
Minimal RPA starter: fill a sandbox form and submit it.
"""

from typing import TypedDict

from intuned_browser import go_to_url
from playwright.async_api import BrowserContext, Page


class Params(TypedDict, total=False):
    name: str
    email: str
    phone: str
    date: str
    time: str
    topic: str


async def automation(
    page: Page,
    params: Params,
    context: BrowserContext | None = None,
    **_kwargs,
):
    await go_to_url(page, "https://sandbox.intuned.dev/consultations/book")

    await page.locator("#name-input").fill(params.get("name", "Foo Bar"))
    await page.locator("#email-input").fill(params.get("email", "foo@bar.com"))
    await page.locator("#phone-input").fill(params.get("phone", "1234567890"))
    await page.locator("#date-input").fill(params.get("date", "2026-11-19"))
    await page.locator("#time-input").fill(params.get("time", "10:00"))
    await page.locator("#topic-select").select_option(params.get("topic", "other"))

    await page.locator("#submit-booking-btn").click()

    modal = page.locator("#success-modal")
    await modal.wait_for(state="visible", timeout=5000)
    title = await page.locator("#success-modal-title").text_content()

    return {
        "success": bool(title and "Successful" in title),
        "message": title,
    }
