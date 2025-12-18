from playwright.async_api import Page, Locator
from typing import TypedDict


class Params(TypedDict):
    pass


async def automation(page: Page, params: Params | None = None, **_kwargs):
    data_list = []
    # Navigate to your page
    await page.goto("https://sandbox.intuned.dev/lists/table/")

    # Locate the main container to check it's state
    container_locator = page.get_by_role("table")
    if await container_locator.is_visible() and await container_locator.count() > 0:
        # Get all rows in the table
        rows = await container_locator.locator("tbody tr").all()
        # For each row scrape column data and create an object to push it to the list
        for row in rows:
            # Scrape Id
            id_locator = row.locator("td").nth(0)
            item_id = (
                await id_locator.text_content()
                if await id_locator.count() > 0
                else None
            )

            # Scrape Name
            name_locator = row.locator("td:nth-of-type(2)")
            status_locator = row.locator("td").last
            name = (
                (await name_locator.text_content()).strip()
                if await name_locator.count() > 0
                else None
            )

            # Scrape Status
            status = (
                (await status_locator.inner_text()).strip()
                if await status_locator.count() > 0
                else None
            )

            # You Can scrape other fields  here

            if item_id and name and status:
                # Create an object in order to push it to the list
                item = {"id": item_id, "name": name, "status": status}

                data_list.append(item)

    return data_list
