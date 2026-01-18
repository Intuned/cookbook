"""
Basic Navigation

Demonstrates fundamental page navigation:
- Navigating to URLs with goto()
- Getting page information (title, URL)
"""

from typing import TypedDict

from playwright.async_api import Page


class Params(TypedDict):
    url: str


async def automation(page: Page, params: Params | None = None, **_kwargs):
    url = (
        params.get("url", "https://books.toscrape.com/")
        if params
        else "https://books.toscrape.com/"
    )

    await page.goto(url)

    title = await page.title()
    current_url = page.url

    return {
        "title": title,
        "url": current_url,
    }
