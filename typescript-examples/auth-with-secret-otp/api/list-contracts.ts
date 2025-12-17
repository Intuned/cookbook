import { BrowserContext, Page } from "playwright";
import { goToUrl } from "@intuned/browser";

import { Contract } from "../utils/typesAndSchemas";

interface Params {}

async function extractContractsFromTable(page: Page): Promise<Contract[]> {
  // Wait for the table to be visible on the page
  // The table is wrapped in a div with rounded-md border classes
  const tableContainer = page.locator("table").first();
  await tableContainer.waitFor({ state: "visible", timeout: 10000 });

  // Find all table rows in the tbody (excluding the header row)
  const tableBody = page.locator("tbody");
  const rowElements = await tableBody.locator("tr").all();

  // Array to store all extracted contract data
  const contracts: Contract[] = [];

  // Loop through each row to extract contract information
  for (const row of rowElements) {
    try {
      // Get all cells in the row
      const cells = await row.locator("td").all();

      // Skip if this is the "No results" row
      if (cells.length === 1) {
        const text = await cells[0].textContent();
        if (text?.includes("No results")) {
          continue;
        }
      }

      // Extract data from each cell based on column order:
      // [0] id, [1] name, [2] supplierName, [3] supplierPhoneNumber,
      // [4] effectiveDate, [5] expirationDate, [6] state

      if (cells.length >= 7) {
        // Extract ID and details URL from the first cell (which contains a link)
        const idCell = cells[0];
        const idLink = idCell.locator("a");
        const id = (await idLink.textContent()) || "";
        const detailsUrl = (await idLink.getAttribute("href")) || "";

        // Extract other fields from their respective cells
        const name = (await cells[1].textContent()) || "";
        const supplierName = (await cells[2].textContent()) || "";
        const supplierPhoneNumber = (await cells[3].textContent()) || "";
        const effectiveDate = (await cells[4].textContent()) || "";
        const expirationDate = (await cells[5].textContent()) || "";
        const state = (await cells[6].textContent()) || "";

        // Create contract object
        const contract: Contract = {
          id: id.trim(),
          name: name.trim(),
          supplierName: supplierName.trim(),
          supplierPhoneNumber: supplierPhoneNumber.trim(),
          effectiveDate: effectiveDate.trim(),
          expirationDate: expirationDate.trim(),
          state: state.trim(),
          detailsUrl: detailsUrl.trim(),
        };

        contracts.push(contract);
      }
    } catch (error) {
      // If extraction fails for a single row, log the error but continue with others
      console.error("Failed to extract contract data from row:", error);
      continue;
    }
  }

  return contracts;
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
): Promise<Contract[]> {
  // Navigate to the contracts list authentication page
  await goToUrl({
    page: page,
    url: "https://sandbox.intuned.dev/list-auth",
  });

  const contracts = await extractContractsFromTable(page);

  // Return the scraped data
  return contracts;
}
