from playwright.async_api import Page, BrowserContext
from intuned_browser import upload_file_to_s3


async def handler(params: dict, page: Page, context: BrowserContext):
    await page.goto("https://www.example.com")

    # Capture screenshot as bytes
    screenshot_in_bytes = await page.screenshot()

    # Upload to S3
    uploaded_file = await upload_file_to_s3(
        file=screenshot_in_bytes,
        file_name_override="screenshot.png",
        content_type="image/png",
    )

    # Get signed URL for access
    signed_url = await uploaded_file.get_signed_url()
    print(f"Check the screenshot at: {signed_url}")
    return uploaded_file

