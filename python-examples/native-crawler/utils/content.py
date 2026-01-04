from intuned_browser import extract_markdown
from intuned_browser.ai import extract_structured_data
from playwright.async_api import Page


async def extract_page_content(
    page: Page,
    schema: dict | None = None,
) -> dict:
    if schema:
        return await extract_structured_data(source=page, data_schema=schema, model="gpt-5-mini")

    title = await page.title()
    markdown = await extract_markdown(page)

    return {
        "title": title,
        "markdown": markdown,
        "markdown_length": len(markdown) if markdown else 0,
    }
