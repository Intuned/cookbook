"""
Download File

Demonstrates downloading files:
- Listening for download events with Playwright
- Using Intuned SDK's download_file helper
"""

from playwright.async_api import Page
from typing import TypedDict
from intuned_browser import download_file


class Params(TypedDict):
    pass


async def automation(page: Page, params: Params | None = None, **_kwargs):
    await page.goto("https://the-internet.herokuapp.com/download")
    await page.wait_for_load_state("load")

    # Method 1: Using Playwright's download event
    # This captures the download when triggered by a click
    async with page.expect_download() as download_info:
        # Click the first download link
        await page.locator("a[href*='.txt']").first.click()

    download = await download_info.value
    playwright_file_name = download.suggested_filename
    playwright_file_path = await download.path()

    # Method 2: Using Intuned SDK's download_file helper
    # This is the recommended approach for Intuned projects

    # Option A: Download from URL directly
    download_link = await page.locator("a[href*='.txt']").first.get_attribute("href")
    # Handle both relative and absolute paths
    if download_link.startswith("/"):
        full_url = f"https://the-internet.herokuapp.com{download_link}"
    else:
        full_url = f"https://the-internet.herokuapp.com/{download_link}"
    url_download = await download_file(page, full_url)

    # Option B: Download from a trigger (locator that triggers download on click)
    trigger_download = await download_file(
        page, page.locator("a[href*='.txt']").first
    )

    return {
        "playwrightDownload": {
            "fileName": playwright_file_name,
            "filePath": str(playwright_file_path) if playwright_file_path else None,
        },
        "intunedDownloadFromUrl": {
            "fileName": url_download.suggested_filename,
        },
        "intunedDownloadFromTrigger": {
            "fileName": trigger_download.suggested_filename,
        },
    }
