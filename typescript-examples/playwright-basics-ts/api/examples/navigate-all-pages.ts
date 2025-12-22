import { BrowserContext, Page } from "playwright";

interface Params {
  // Add your params if needed
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  /**
   * Navigate through all pages on the website
   * and scrape book titles from each page.
   */

  await page.goto("https://books.toscrape.com/index.html");
  await page.waitForLoadState("networkidle");

  const allTitles: Array<{ page: number; book_title: string | null }> = [];
  let pageNumber = 1;

  while (true) {
    console.log(`Scraping page ${pageNumber}`);

    // Locate the container that holds all books
    const container = page.locator("section ol.row");

    if ((await container.count()) > 0) {
      const items = await container.locator("li article.product_pod").all();

      for (const item of items) {
        const titleLocator = item.locator("h3 a");

        if ((await titleLocator.count()) > 0) {
          const title = await titleLocator.getAttribute("title");
          allTitles.push({
            page: pageNumber,
            book_title: title,
          });
        }
      }
    }

    // Locate the "Next" pagination button
    const nextButton = page.locator("li.next a");

    // If "Next" exists, move to the next page
    if ((await nextButton.count()) > 0 && (await nextButton.isVisible())) {
      await nextButton.click();
      await page.waitForLoadState("networkidle");
      pageNumber += 1;
    } else {
      // No next button means this is the last page
      break;
    }
  }

  console.log(allTitles);
  return allTitles;
}
