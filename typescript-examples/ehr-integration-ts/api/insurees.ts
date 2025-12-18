import { BrowserContext, Page } from "playwright";

interface Params {
  // Add your params here
}

type Insuree = {
  insurance_number: string;
  head_last_name: string;
  head_given_name: string;
  marital_status: string;
  gender: string;
};

async function extractInsureesData(page: Page): Promise<Insuree[]> {
  // Wait for data table to load
  await page.waitForSelector("table");

  // Extract insurees data from the table
  const insurees = await page.evaluate<Insuree[]>(() => {
    const rows = Array.from(document.querySelectorAll("tbody tr"));

    return rows
      .map(row => {
        const cells = Array.from(row.querySelectorAll("td"));

        if (cells.length >= 6) {
          return {
            insurance_number: cells[0]?.textContent?.trim() || "",
            head_last_name: cells[1]?.textContent?.trim() || "",
            head_given_name: cells[2]?.textContent?.trim() || "",
            marital_status: cells[3]?.textContent?.trim() || "",
            gender: cells[4]?.textContent?.trim() || ""
          };
        }

        return null;
      })
      .filter((insuree): insuree is Insuree => insuree !== null);
  });

  return insurees;
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  const allResults: Insuree[] = [];

  await page.goto("https://demo.openimis.org/front/insuree/insurees");
  await page.waitForTimeout(6_000);

  while (true) {
    // Extract data from current page
    const result = await extractInsureesData(page);
    allResults.push(...result);

    // Locate the "Next" button
    const nextButton = page.locator("button[title='Next page']");

    // Check if the button is hidden or disabled
    if (!(await nextButton.isVisible()) || (await nextButton.isDisabled())) {
      break;
    }

    // Click "Next" and wait for the table to update
    await nextButton.click();
    await page.waitForTimeout(2_000); // optional small delay
    await page.waitForLoadState("networkidle");
  }

  console.log(`Total records extracted: ${allResults.length}`);
  return allResults;
}
