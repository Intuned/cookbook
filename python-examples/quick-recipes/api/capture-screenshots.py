from typing import TypedDict

from intuned_browser import upload_file_to_s3
from playwright.async_api import Page


class Params(TypedDict):
    pass


async def automation(page: Page, params: Params | None = None, **_kwargs):
    # Navigate to the page to capture
    await page.goto("https://intunedhq.com/")

    # Capture screenshot as bytes
    screenshot_in_bytes = await page.screenshot()

    # Upload the screenshot to S3
    # https://docs.intunedhq.com/automation-sdks/intuned-sdk/python/helpers/functions/upload_file_to_s3

    uploaded_file = await upload_file_to_s3(
        file=screenshot_in_bytes,
        file_name_override="screenshot.png",
        content_type="image/png",
    )

    # Provide a signed URL for retrieval
    signed_url = await uploaded_file.get_signed_url()
    print(f"Check the screenshot at: {signed_url}")
    return uploaded_file
