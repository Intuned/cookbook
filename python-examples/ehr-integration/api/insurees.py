from typing import TypedDict

from intuned_browser import go_to_url
from playwright.async_api import Page


class Params(TypedDict):
    max_pages: int


async def extract_insurees_data(page: Page) -> list[dict[str, str]]:
    """Extract insurees data from openIMIS"""

    # Wait for data table to load
    await page.wait_for_selector("table")

    # Extract some insuree data from the table
    insurees = await page.evaluate("""() => {
        const rows = Array.from(document.querySelectorAll('tbody tr'));
        return rows.map(row => {
            const cells = Array.from(row.querySelectorAll('td'));
            if (cells.length >= 6) {
                return {
                    insurance_number: cells[0]?.textContent?.trim() || '',
                    head_last_name: cells[1]?.textContent?.trim() || '',
                    head_given_name: cells[2]?.textContent?.trim() || '',
                    marital_status: cells[3]?.textContent?.trim() || '',
                    gender: cells[4]?.textContent?.trim() || '',
                };
            }
            return null;
        }).filter(insuree => insuree !== null);
    }""")

    return insurees


async def automation(page: Page, params: Params | None = None, **_kwargs):
    all_results = []
    await go_to_url(page, "https://demo.openimis.org/front/insuree/insurees")
    max_pages = params.max_pages if params else 10
    current_page = 0
    while current_page < max_pages:
        current_page += 1
        # Extract data from current page
        result = await extract_insurees_data(page)
        all_results.extend(result)

        # Locate the "Next" button
        next_button = page.locator("button[title='Next page']")

        # Check if the button is either hidden or disabled
        if not await next_button.is_visible() or await next_button.is_disabled():
            break

        # Click "Next" and wait for the table to update
        await next_button.click()
        # Wait for the table content to change before next extraction
        await page.wait_for_timeout(2000)  # optional small delay
        await page.wait_for_load_state("networkidle")

    print(f"Total records extracted: {len(all_results)}")
    return all_results
