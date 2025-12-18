import { BrowserContext, Page } from "playwright";

interface Params {
  // Add your params here
}

type Claim = {
  claim_number: string;
  health_facility: string;
  insuree: string;
  claimed_date: string;
  feedback_status: string;
  review_status: string;
  claimed_amount: string;
  approved_amount: string;
  status: string;
};

async function extractClaimsData(page: Page): Promise<Claim[]> {
  // Wait for claims table to load
  await page.waitForSelector("table");

  // Extract claims data from the table
  const claims = await page.evaluate<Claim[]>(() => {
    const rows = Array.from(document.querySelectorAll("tbody tr"));

    return rows
      .map(row => {
        const cells = Array.from(row.querySelectorAll("td"));

        if (cells.length >= 8) {
          return {
            claim_number: cells[0]?.textContent?.trim() || "",
            health_facility: cells[1]?.textContent?.trim() || "",
            insuree: cells[2]?.textContent?.trim() || "",
            claimed_date: cells[3]?.textContent?.trim() || "",
            feedback_status: cells[5]?.textContent?.trim() || "",
            review_status: cells[6]?.textContent?.trim() || "",
            claimed_amount: cells[7]?.textContent?.trim() || "",
            approved_amount: cells[8]?.textContent?.trim() || "",
            status: cells[9]?.textContent?.trim() || ""
          };
        }

        return null;
      })
      .filter((claim): claim is Claim => claim !== null);
  });

  return claims;
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  const allResults: Claim[] = [];

  await page.goto("https://demo.openimis.org/front/claim/healthFacilities");
  await page.waitForTimeout(5_000);

  while (true) {
    // Extract data from current page
    const result = await extractClaimsData(page);
    allResults.push(...result);

    // Check if "Next" button is disabled
    const nextButton = page.locator("button[title='Next page']");
    if (await nextButton.isDisabled()) {
      break;
    }

    // Click next and wait for page to load
    await nextButton.click();
    await page.waitForLoadState("networkidle");
  }

  return allResults;
}
