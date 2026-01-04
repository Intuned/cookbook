from typing import TypedDict

from intuned_browser import save_file_to_s3
from playwright.async_api import Page


class Params(TypedDict):
    pass


async def automation(page: Page, params: Params | None = None, **_kwargs):
    # Navigate to the file list
    await page.goto("https://sandbox.intuned.dev/pdfs")

    # Locate the download trigger for the first row
    download_locator = page.locator("xpath=//tbody/tr[1]//*[name()='svg']")

    # Download and upload to S3 in one step
    # https://docs.intunedhq.com/automation-sdks/intuned-sdk/python/helpers/functions/save_file_to_s3
    uploaded_file = await save_file_to_s3(
        page=page,
        trigger=download_locator,
    )

    # Return signed URL for access
    signed_url = await uploaded_file.get_signed_url()
    print(f"Download uploaded file at: {signed_url}")
    return signed_url
