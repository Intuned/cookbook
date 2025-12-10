from playwright.async_api import Page, BrowserContext
from intuned_browser import download_file


async def handler(params: dict, page: Page, context: BrowserContext):
    # Navigate to the sample downloads page
    await page.goto("https://sandbox.intuned.dev/pdfs")

    # Locate the download button for the first row
    download_locator = page.locator("xpath=//tbody/tr[1]//*[name()='svg']")

    # Trigger download and wait for the file
    downloaded_file = await download_file(
        page=page,
        trigger=download_locator,
        timeout_in_ms=15000,
    )

    # Return the suggested filename for reference
    file_name = downloaded_file.suggested_filename()
    return file_name
