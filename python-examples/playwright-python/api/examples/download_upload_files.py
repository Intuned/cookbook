from playwright.async_api import Page
from typing import TypedDict
from intuned_browser import download_file
from intuned_browser import upload_file_to_s3, S3Configs
# from intuned_runtime import extend_payload


class Params(TypedDict):
    pass


async def automation(page: Page, params: Params | None = None, **_kwargs):
    await page.goto("https://www.princexml.com/samples/")
    await page.wait_for_load_state("networkidle")

    # Download file
    downloaded_xml_file = await download_file(
        page=page,
        trigger=page.locator("#dictionary > p.links > a:nth-child(2)"),
    )

    print(
        {
            "path": await downloaded_xml_file.path(),
            "suggestedName": downloaded_xml_file.suggested_filename,
        }
    )

    # Upload to S3
    s3_config = S3Configs(
        bucket_name="my-documents",
        region="us-west-1",
        access_key="accessKeyId",
        secret_key="SecretAccessKeyId",
    )
    file = await upload_file_to_s3(downloaded_xml_file, configs=s3_config)

    return {
        "signedUrl": await file.get_signed_url(),
        "filePath": file.get_file_path(),
    }
