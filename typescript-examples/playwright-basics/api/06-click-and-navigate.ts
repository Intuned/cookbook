import { BrowserContext, Page } from "playwright";

/**
 * Click and Navigate
 *
 * Demonstrates clicking elements and handling navigation:
 * - Simple clicks
 * - Waiting after clicks
 * - Navigating through pagination
 */

interface Params {
  pagesToNavigate?: number;
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  await page.goto("https://books.toscrape.com/");
  await page.waitForLoadState("networkidle");

  const pagesToNavigate = params.pagesToNavigate ?? 3;
  const visitedPages: string[] = [page.url()];

  for (let i = 0; i < pagesToNavigate - 1; i++) {
    // Find the "next" button
    const nextButton = page.locator("li.next a");

    // Check if next button exists
    if (!(await nextButton.isVisible())) {
      console.log("No more pages to navigate");
      break;
    }

    // Click and wait for navigation
    await nextButton.click();
    await page.waitForLoadState("networkidle");

    visitedPages.push(page.url());
    console.log(`Navigated to page ${i + 2}: ${page.url()}`);
  }

  // Click on a category link
  const travelCategory = page.locator("a", { hasText: "Travel" });
  if (await travelCategory.isVisible()) {
    await travelCategory.click();
    await page.waitForLoadState("networkidle");
    visitedPages.push(page.url());
  }

  return {
    pagesVisited: visitedPages.length,
    urls: visitedPages,
  };
}
