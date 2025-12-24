# https://docs.intunedhq.com/automation-sdks/intuned-sdk/python/helpers/functions/download_file
from playwright.async_api import Page
from typing import TypedDict
from intuned_browser import download_file
# from intuned_runtime import extend_payload


class Params(TypedDict):
    timeout: int | None


async def automation(page: Page, params: Params | None = None, **_kwargs):
    timeout = params.get("timeout") if params else 15
    # Direct download from URL
    download = await download_file(page, 'https://intuned-docs-public-images.s3.amazonaws.com/32UP83A_ENG_US.pdf',timeout_s=timeout)
    print("Result of downloading file from URL:")
    print(download.suggested_filename)
    
    # Download from trigger
    await page.goto("https://sandbox.intuned.dev/pdfs")
    download = await download_file(page, page.locator("xpath=//tbody/tr[1]//*[name()='svg']"))
    print("Result of downloading file from trigger:")
    print(download.suggested_filename)
    
    # Download from trigger with custom callable function
    await page.goto("https://sandbox.intuned.dev/pdfs")
    download = await download_file(page, lambda page: page.locator("xpath=//tbody/tr[1]//*[name()='svg']").click())
    print("Result of downloading file from trigger with custom callable function:")
    print(download.suggested_filename)
    
    return download.suggested_filename