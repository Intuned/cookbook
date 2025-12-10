from playwright.async_api import Page, BrowserContext
from intuned_browser import save_file_to_s3


async def handler(params: dict, page: Page, context: BrowserContext):
    await page.goto("https://sandbox.intuned.dev/pdfs")

    # Locate the download button
    download_locator = page.locator("xpath=//tbody/tr[1]//*[name()='svg']")

    # Download and upload to S3 in one step
    uploaded_file = await save_file_to_s3(
        page=page,
        trigger=download_locator,
        timeout_in_ms=15000,
    )

    # Get signed URL for access
    signed_url = await uploaded_file.get_signed_url()
    print(f"Download uploaded file at: {signed_url}")
    return uploaded_file

