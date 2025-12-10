from playwright.async_api import Page, BrowserContext
from intuned_browser import download_file


async def handler(params: dict, page: Page, context: BrowserContext):
    await page.goto("https://sandbox.intuned.dev/pdfs")

    # Locate the download button
    download_locator = page.locator("xpath=//tbody/tr[1]//*[name()='svg']")

    # Trigger download and wait for file
    downloaded_file = await download_file(
        page=page,
        trigger=download_locator,
        timeout_in_ms=15000,
    )

    file_name = downloaded_file.suggested_filename()
    return file_name

