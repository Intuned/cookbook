# https://docs.intunedhq.com/automation-sdks/intuned-sdk/python/helpers/functions/save_file_to_s3
from playwright.async_api import Page
from typing import TypedDict
from intuned_browser import save_file_to_s3
from intuned_browser import go_to_url


class Params(TypedDict):
    pass


async def automation(page: Page, params: Params | None = None, **_kwargs):
    await go_to_url(page, "https://sandbox.intuned.dev/pdfs")
    # Download using a locator
    uploaded_file = await save_file_to_s3(
        page=page,
        trigger=page.locator("xpath=//tbody/tr[1]//*[name()='svg']"),
    )
    signed_url = await uploaded_file.get_signed_url()
    print(f"Signed URL: {signed_url}")
    return signed_url