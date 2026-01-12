from typing import TypedDict

from intuned_browser import go_to_url
from playwright.async_api import Page


class Params(TypedDict):
    max_pages: int


async def extract_claims_data(page: Page) -> list[dict[str, str]]:
    """Extract claims data from openIMIS"""

    # Wait for claims table to load
    await page.wait_for_selector("table")

    # Extract claims data from the table
    claims = await page.evaluate("""() => {
        const rows = Array.from(document.querySelectorAll('tbody tr'));
        return rows.map(row => {
            const cells = Array.from(row.querySelectorAll('td'));
            if (cells.length >= 8) {
                return {
                    claim_number: cells[0]?.textContent?.trim() || '',
                    health_facility: cells[1]?.textContent?.trim() || '',
                    insuree: cells[2]?.textContent?.trim() || '',
                    claimed_date: cells[3]?.textContent?.trim() || '',
                    feedback_status: cells[5]?.textContent?.trim() || '',
                    review_status: cells[6]?.textContent?.trim() || '',
                    claimed_amount: cells[7]?.textContent?.trim() || '',
                    approved_amount: cells[8]?.textContent?.trim() || '',
                    status: cells[9]?.textContent?.trim() || ''
                };
            }
            return null;
        }).filter(claim => claim !== null);
    }""")

    return claims


async def automation(page: Page, params: Params | None = None, **_kwargs):
    all_results = []
    await go_to_url(page, "https://demo.openimis.org/front/claim/healthFacilities")
    max_pages = params.max_pages if params else 10
    current_page = 0
    while current_page < max_pages:
        current_page += 1
        # Extract data from current page
        result = await extract_claims_data(page)
        all_results.extend(result)

        # Check if "Next" button is enabled
        next_button = page.locator("button[title='Next page']")
        if await next_button.is_disabled():
            break

        # Click next and wait for page to load
        await next_button.click()
        await page.wait_for_load_state("networkidle")

    return all_results
