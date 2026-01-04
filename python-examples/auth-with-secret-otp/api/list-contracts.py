from typing import TypedDict

from intuned_browser import go_to_url
from playwright.async_api import Page
from utils.types_and_schemas import Contract


class Params(TypedDict):
    pass


async def extract_contracts_from_table(page: Page) -> list[Contract]:
    # Wait for the table to be visible on the page
    # The table is wrapped in a div with rounded-md border classes
    table_container = page.locator("table").first
    await table_container.wait_for(state="visible", timeout=10_000)

    # Find all table rows in the tbody (excluding the header row)
    table_body = page.locator("tbody")
    row_elements = await table_body.locator("tr").all()

    # Array to store all extracted contract data
    contracts: list[Contract] = []

    # Loop through each row to extract contract information
    for row in row_elements:
        try:
            # Get all cells in the row
            cells = await row.locator("td").all()

            # Skip if this is the "No results" row
            if len(cells) == 1:
                text = await cells[0].text_content()
                if text and "No results" in text:
                    continue

            # Extract data from each cell based on column order:
            # [0] id, [1] name, [2] supplierName, [3] supplierPhoneNumber,
            # [4] effectiveDate, [5] expirationDate, [6] state

            if len(cells) >= 7:
                # Extract ID and details URL from the first cell (which contains a link)
                id_cell = cells[0]
                id_link = id_cell.locator("a")
                contract_id = await id_link.text_content() or ""
                details_url = await id_link.get_attribute("href") or ""

                # Extract other fields from their respective cells
                name = await cells[1].text_content() or ""
                supplier_name = await cells[2].text_content() or ""
                supplier_phone_number = await cells[3].text_content() or ""
                effective_date = await cells[4].text_content() or ""
                expiration_date = await cells[5].text_content() or ""
                state = await cells[6].text_content() or ""

                # Create contract object
                contract = Contract(
                    id=contract_id.strip(),
                    name=name.strip(),
                    supplier_name=supplier_name.strip(),
                    supplier_phone_number=supplier_phone_number.strip(),
                    effective_date=effective_date.strip(),
                    expiration_date=expiration_date.strip(),
                    state=state.strip(),
                    details_url=details_url.strip(),
                )

                contracts.append(contract)

        except Exception as error:
            # If extraction fails for a single row, log the error but continue with others
            print(f"Failed to extract contract data from row: {error}")
            continue

    return contracts


async def automation(
    page: Page, params: Params | None = None, **_kwargs
) -> list[Contract]:
    # Navigate to the contracts list authentication page
    await go_to_url(
        page=page,
        url="https://sandbox.intuned.dev/list-auth",
    )

    contracts = await extract_contracts_from_table(page)

    # Return the scraped data
    return contracts
