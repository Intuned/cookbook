from playwright.async_api import Page
from typing import TypedDict, List, Dict
from intuned_browser import go_to_url


class Params(TypedDict):
    pass


async def extract_families_data(page: Page) -> List[Dict[str, str]]:
    """Extract family/group data from openIMIS"""

    # Wait for data table to load
    await page.wait_for_selector("table")

    # Extract family data from the table
    families = await page.evaluate("""() => {
        const rows = Array.from(document.querySelectorAll('tbody tr'));
        return rows.map(row => {
            const cells = Array.from(row.querySelectorAll('td'));
            if (cells.length >= 6) {
                return {
                    insurance_number: cells[0]?.textContent?.trim() || '',
                    head_last_name: cells[1]?.textContent?.trim() || '',
                    head_given_name: cells[2]?.textContent?.trim() || '',
                    head_birth_date: cells[5]?.textContent?.trim() || '',
                    region: cells[6]?.textContent?.trim() || '',
                    district: cells[7]?.textContent?.trim() || '',
                    municipality: cells[8]?.textContent?.trim() || '',
                    village: cells[9]?.textContent?.trim() || ''
                };
            }
            return null;
        }).filter(family => family !== null);
    }""")

    return families


async def automation(page: Page, params: Params | None = None, **_kwargs):
    all_results = []
    await go_to_url(page, "https://demo.openimis.org/front/insuree/families")
    while True:
        # Extract data from current page
        result = await extract_families_data(page)
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
