# https://docs.intunedhq.com/automation-sdks/intuned-sdk/python/helpers/functions/upload_file_to_s3
from playwright.async_api import Page
from typing import TypedDict
from intuned_browser import upload_file_to_s3
from intuned_browser import download_file


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
    print("Signed URL:")
    print(signed_url)
    return signed_url
