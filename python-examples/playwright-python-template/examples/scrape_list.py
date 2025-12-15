from playwright.async_api import Page, Locator
from utils.navigation import playwright_navigate, intuned_navigate
from utils.locators import by_role, is_visible, count
from utils.scrapping import get_text


async def scrape_list(page: Page, url: str):
    data_list = []
    # Step One: Navigate to your page
    await playwright_navigate(page, url)
    # You Can also navigate to the page by using intuned_navigate
    # await intuned_navigate(page,url)

    # Locate the main container to check it's state
    container_locator = await by_role(page, "table")
    if await is_visible(container_locator) and await count(container_locator) > 0:
        rows = await container_locator.locator("tbody tr").all()
        for row in rows:
            name = await get_text(row.locator("td:nth-of-type(2)"))
            status = await get_text(row.locator("td").last)

            item = {"name": name, "status": status}
            if name:
                data_list.append(item)

    return data_list
