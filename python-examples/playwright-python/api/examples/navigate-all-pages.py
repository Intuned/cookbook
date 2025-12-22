from playwright.async_api import Page
from typing import TypedDict


class Params(TypedDict):
    pass


async def automation(page: Page, params: Params | None = None, **_kwargs):
    """
    Navigate through all pages on the website
    and scrape book titles from each page.
    """

    await page.goto("https://books.toscrape.com/index.html")
    await page.wait_for_load_state("networkidle")

    all_titles = []
    page_number = 1

    while True:
        print(f"Scraping page {page_number}")

        # Locate the container that holds all books
        container = page.locator("section ol.row")

        if await container.count() > 0:
            items = await container.locator("li article.product_pod").all()

            for item in items:
                title_locator = item.locator("h3 a")

                if await title_locator.count() > 0:
                    title = await title_locator.get_attribute("title")
                    all_titles.append(
                        {
                            "page": page_number,
                            "book_title": title,
                        }
                    )

        # Locate the "Next" pagination button
        next_button = page.locator("li.next a")

        # If "Next" exists, move to the next page
        if await next_button.count() > 0 and await next_button.is_visible():
            await next_button.click()
            await page.wait_for_load_state("networkidle")
            page_number += 1
        else:
            # No next button means this is the last page
            break
    print(all_titles)
    return all_titles
