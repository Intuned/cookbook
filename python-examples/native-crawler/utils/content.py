from playwright.async_api import Page

from intuned_browser import extract_markdown


async def extract_page_content(page: Page) -> dict:
    title = await page.title()

    markdown = await extract_markdown(page)

    return {
        "title": title,
        "markdown": markdown,
        "markdown_length": len(markdown) if markdown else 0,
    }
