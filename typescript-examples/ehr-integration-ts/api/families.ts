import { BrowserContext, Page } from "playwright";

interface Params {
  // Add your params here
}

type Family = {
  insurance_number: string;
  head_last_name: string;
  head_given_name: string;
  head_birth_date: string;
  region: string;
  district: string;
  municipality: string;
  village: string;
};

async function extractFamiliesData(page: Page): Promise<Family[]> {
  // Wait for data table to load
  await page.waitForSelector("table");

  // Extract family data from the table
  const families = await page.evaluate<Family[]>(() => {
    const rows = Array.from(document.querySelectorAll("tbody tr"));

    return rows
      .map(row => {
        const cells = Array.from(row.querySelectorAll("td"));

        if (cells.length >= 6) {
          return {
            insurance_number: cells[0]?.textContent?.trim() || "",
            head_last_name: cells[1]?.textContent?.trim() || "",
            head_given_name: cells[2]?.textContent?.trim() || "",
            head_birth_date: cells[5]?.textContent?.trim() || "",
            region: cells[6]?.textContent?.trim() || "",
            district: cells[7]?.textContent?.trim() || "",
            municipality: cells[8]?.textContent?.trim() || "",
            village: cells[9]?.textContent?.trim() || ""
          };
        }

        return null;
      })
      .filter((family): family is Family => family !== null);
  });

  return families;
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  const allResults: Family[] = [];

  await page.goto("https://demo.openimis.org/front/insuree/families");
  await page.waitForTimeout(6_000);

  while (true) {
    // Extract data from current page
    const result = await extractFamiliesData(page);
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
