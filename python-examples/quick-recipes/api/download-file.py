from typing import TypedDict

from intuned_browser import download_file
from playwright.async_api import Page


class Params(TypedDict):
    pass


async def automation(page: Page, params: Params | None = None, **_kwargs):
    # Navigate to the sample downloads page
    await page.goto("https://sandbox.intuned.dev/pdfs")

    # Locate the download button for the first row
    download_locator = page.locator("xpath=//tbody/tr[1]//*[name()='svg']")

    # Trigger download and wait for the file
    # https://docs.intunedhq.com/automation-sdks/intuned-sdk/python/helpers/functions/download_file
    downloaded_file = await download_file(
        page=page,
        trigger=download_locator,
        timeout_s=15,
    )

    # Return the suggested filename for reference
    file_name = downloaded_file.suggested_filename
    print(f"Downloaded file: {file_name}")
    return {
        "file_name": file_name,
    }
