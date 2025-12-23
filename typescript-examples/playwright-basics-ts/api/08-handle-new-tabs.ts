import { BrowserContext, Page } from "playwright";

/**
 * Handle New Tabs and Popups
 *
 * Demonstrates handling pages that open in new tabs:
 * - Capturing new pages with waitForEvent
 * - Handling popups
 * - Working with multiple pages
 */

interface Params {}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  await page.goto("https://books.toscrape.com/");
  await page.waitForLoadState("networkidle");

  // Get the first book link
  const firstBookLink = page.locator(".product_pod h3 a").first();
  const bookTitle = await firstBookLink.getAttribute("title");

  // Method 1: Navigate in the same page
  await firstBookLink.click();
  await page.waitForLoadState("networkidle");
  const bookPrice = await page.locator(".price_color").first().textContent();

  // Go back to the list
  await page.goBack();
  await page.waitForLoadState("networkidle");

  // Method 2: Open in a new page (simulating target="_blank")
  // Create a new page manually
  const newPage = await context.newPage();
  await newPage.goto("https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html");
  await newPage.waitForLoadState("networkidle");

  const newPageTitle = await newPage.locator(".product_main h1").textContent();
  const newPagePrice = await newPage.locator(".price_color").first().textContent();

  // Close the new page when done
  await newPage.close();

  // Method 3: Handle links that open new tabs
  // When a click triggers a new tab, capture it with waitForEvent
  // Example (commented as books.toscrape doesn't have target="_blank" links):
  // const [popup] = await Promise.all([
  //   context.waitForEvent("page"),
  //   page.locator("a[target='_blank']").click(),
  // ]);
  // await popup.waitForLoadState("domcontentloaded");
  // const popupTitle = await popup.title();
  // await popup.close();

  return {
    originalPage: {
      title: bookTitle,
      price: bookPrice,
    },
    newPage: {
      title: newPageTitle?.trim(),
      price: newPagePrice,
    },
  };
}
