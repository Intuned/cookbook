import { BrowserContext, Page } from "playwright";

interface Params {
  // Add your params if needed
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  const dataList: Array<{ id: string; name: string; status: string }> = [];

  // Navigate to the page
  await page.goto("https://sandbox.intuned.dev/lists/table/");

  // Locate the main table
  const containerLocator = page.getByRole("table");

  if (await containerLocator.isVisible() && (await containerLocator.count()) > 0) {
    // Get all rows in the table
    const rows = await containerLocator.locator("tbody tr").all();

    for (const row of rows) {
      // Scrape Id
      const idLocator = row.locator("td").nth(0);
      const itemId = (await idLocator.count()) > 0 ? await idLocator.textContent() : null;

      // Scrape Name
      const nameLocator = row.locator("td:nth-of-type(2)");
      const name = (await nameLocator.count()) > 0 ? (await nameLocator.textContent())?.trim() : null;

      // Scrape Status
      const statusLocator = row.locator("td").last();
      const status = (await statusLocator.count()) > 0 ? (await statusLocator.innerText()).trim() : null;

      if (itemId && name && status) {
        dataList.push({ id: itemId, name, status });
      }
    }
  }

  return dataList;
}
