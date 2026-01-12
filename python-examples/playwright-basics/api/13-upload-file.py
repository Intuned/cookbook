"""
Upload File

Demonstrates uploading files to S3:
- Using Intuned SDK's download_file and upload_file_to_s3 helpers
- Uploading downloaded files to S3
"""

from typing import TypedDict

from intuned_browser import download_file, upload_file_to_s3
from playwright.async_api import Page


class Params(TypedDict):
    pass


async def automation(page: Page, params: Params | None = None, **_kwargs):
    # First, download a file using Intuned SDK
    await page.goto("https://the-internet.herokuapp.com/download")
    await page.wait_for_load_state("load")

    # Download a file
    downloaded_file = await download_file(page, page.locator("a[href*='.txt']").first)

    print(f"Downloaded: {downloaded_file.suggested_filename}")

    # Upload the downloaded file to S3 using Intuned SDK
    # When no S3Configs are provided, it uses Intuned's managed S3 bucket
    uploaded_file = await upload_file_to_s3(
        downloaded_file,
        file_name_override="uploaded-file.txt",
        content_type="text/plain",
    )

    # Get the signed URL for the uploaded file
    signed_url = await uploaded_file.get_signed_url()
    file_path = uploaded_file.get_file_path()

    return {
        "message": "File uploaded successfully",
        "downloadedFileName": downloaded_file.suggested_filename,
        "uploadedFilePath": file_path,
        "signedUrl": signed_url,
    }
