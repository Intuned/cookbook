from playwright.async_api import Page
from typing import TypedDict
from intuned_browser import save_file_to_s3
from intuned_browser import S3Configs
from intuned_browser import go_to_url
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
    await go_to_url(page, "https://sandbox.intuned.dev/pdfs")
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
    # Download using a locator
    uploaded_file = await save_file_to_s3(
        page=page,
        trigger=page.locator("xpath=//tbody/tr[1]//*[name()='svg']"),
        timeout_s=10,
        configs=s3_config
    )
    print(f"File uploaded to: {uploaded_file.key}")