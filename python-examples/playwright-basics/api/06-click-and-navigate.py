"""
Click and Navigate

Demonstrates clicking elements and navigation:
- Clicking links and buttons
- Pagination through pages
- Using go_back() to return to previous page
"""

from typing import TypedDict

from playwright.async_api import Page


class Params(TypedDict):
    pagesToVisit: int


async def automation(page: Page, params: Params | None = None, **_kwargs):
    pages_to_visit = params.get("pagesToVisit", 3) if params else 3

    await page.goto("https://books.toscrape.com/")
    await page.wait_for_load_state("networkidle")

    visited_urls = [page.url]

    # Navigate through pages using the "next" button
    for _ in range(pages_to_visit - 1):
        next_button = page.locator("li.next a")

        if await next_button.count() > 0:
            await next_button.click()
            await page.wait_for_load_state("networkidle")
            visited_urls.append(page.url)
            print(f"Navigated to page: {page.url}")
        else:
            break

    # Click on a category link
    travel_link = page.locator('a:has-text("Travel")')
    if await travel_link.count() > 0:
        await travel_link.click()
        await page.wait_for_load_state("networkidle")
        visited_urls.append(page.url)

    return {
        "pagesVisited": len(visited_urls),
        "urls": visited_urls,
    }
