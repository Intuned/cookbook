import { BrowserContext, Page } from "playwright";

interface Params {
    pagesToNavigate: number;
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  /**
   * Navigate from the first page up to a specific page number.
   *
   * @param page Playwright Page instance
   * @param pages_to_navigate Number of pages to navigate through
   */

  await page.goto("https://books.toscrape.com/index.html");
  await page.waitForLoadState("networkidle");

  const pagesToNavigate = params.pagesToNavigate;
  if (!pagesToNavigate) {
    throw new Error("Number of Pages Must Be Provided");
  }

  let currentPage = 1;

  while (currentPage < pagesToNavigate) {
    console.log(`Currently on page ${currentPage}`);

    const nextButton = page.locator("li.next a");

    // Stop if there is no "Next" button (last page reached)
    if ((await nextButton.count()) === 0 || !(await nextButton.isVisible())) {
      console.log("No more pages available.");
      break;
    }

    await nextButton.click();
    await page.waitForLoadState("networkidle");

    currentPage += 1;
  }

  console.log(`Stopped at page ${currentPage}`);
}
