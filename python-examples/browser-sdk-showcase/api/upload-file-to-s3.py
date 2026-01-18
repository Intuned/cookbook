# https://docs.intunedhq.com/automation-sdks/intuned-sdk/python/helpers/functions/upload_file_to_s3
from typing import TypedDict

from intuned_browser import download_file, upload_file_to_s3
from playwright.async_api import Page


class Params(TypedDict):
    pass


async def automation(page: Page, params: Params, **_kwargs):
    # Download a file first
    download = await download_file(
        page, "https://intuned-docs-public-images.s3.amazonaws.com/32UP83A_ENG_US.pdf"
    )
    uploaded_file = await upload_file_to_s3(
        download,
        file_name_override="myfile.pdf",
        content_type="application/pdf",
    )
    signed_url = await uploaded_file.get_signed_url()
    print("Signed URL:", signed_url)
    return {
        "file_name": uploaded_file.file_name,
        "signed_url": signed_url,
        "message": "File uploaded successfully to S3",
    }
