from playwright.async_api import Page
from typing import TypedDict
from intuned_browser import download_file
# from intuned_runtime import extend_payload


class Params(TypedDict):
    timeout: int | None


async def automation(page: Page, params: Params | None = None, **_kwargs):
    timeout = params.get("timeout", 15)
    # Direct download from URL
    download = await download_file(page, 'https://intuned-docs-public-images.s3.amazonaws.com/32UP83A_ENG_US.pdf',timeout_s=timeout)
    print(download.suggested_filename)
    
    # Download from trigger
    await page.goto("https://sandbox.intuned.dev/pdfs")
    download = await download_file(page, page.locator("xpath=//tbody/tr[1]//*[name()='svg']"))
    print(download.suggested_filename)
    
    # Download from trigger with custom callable function
    await page.goto("https://sandbox.intuned.dev/pdfs")
    download = await download_file(page, lambda page: page.locator("xpath=//tbody/tr[1]//*[name()='svg']").click())
    print(download.suggested_filename)
    
    return download.suggested_filename