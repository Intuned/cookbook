from playwright.async_api import Page
from typing import TypedDict
from intuned_browser import upload_file_to_s3
from intuned_browser import download_file
from intuned_browser import S3Configs
# from intuned_runtime import extend_payload


class Params(TypedDict):
    bucket : str | None
    region : str | None
    access_key : str | None
    secret_key : str | None
    pass


async def automation(page: Page, params: Params | None = None, **_kwargs):
    # Download a file first
    bucket = params.get("bucket", None)
    region = params.get("region", None)
    access_key = params.get("access_key", None)
    secret_key = params.get("secret_key", None)
    download = await download_file(page, "https://intuned-docs-public-images.s3.amazonaws.com/32UP83A_ENG_US.pdf")
    # Configure S3 configuration
    # Priority: params → environment variables → Intuned's managed S3 bucket (default)
    s3_config = None
    if bucket and region and access_key and secret_key:
        s3_config = S3Configs(
        bucket_name=bucket,
        region=region,
        access_key=access_key,
        secret_key=secret_key,
    )
    uploaded_file = await upload_file_to_s3(download, configs=s3_config, file_name_override="myfile.pdf", content_type="application/pdf")
    print( await uploaded_file.get_signed_url())