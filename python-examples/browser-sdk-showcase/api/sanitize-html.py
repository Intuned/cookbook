# https://docs.intunedhq.com/automation-sdks/intuned-sdk/python/helpers/functions/sanitize_html
from typing import TypedDict

from intuned_browser import sanitize_html
from playwright.async_api import Page

# from intuned_runtime import extend_payload


class Params(TypedDict):
    remove_styles: bool | None
    max_attribute_length: int | None


async def automation(page: Page, params: Params | None = None, **_kwargs):
    await page.goto("https://books.toscrape.com")
    remove_styles = params.get("remove_styles", True)
    max_attribute_length = params.get("max_attribute_length", 100)
    first_row = page.locator("ol.row").locator("li").first
    html = await first_row.inner_html()
    sanitized_html = sanitize_html(html, remove_styles=remove_styles, max_attribute_length=max_attribute_length)
    print("Sanitized HTML:")
    print(sanitized_html)
    return {
        "sanitized_html": sanitized_html,
    }
