import { BrowserContext, Page } from "playwright";
import { goToUrl, waitForDomSettled } from "@intuned/browser";

/**
 * Handle New Tabs and Popups
 *
 * Demonstrates handling pages that open in new tabs:
 * - Capturing new pages with waitForEvent
 * - Handling popups
 * - Working with multiple pages
 */

interface Params { }

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  await goToUrl({ page, url: "https://books.toscrape.com/" });
  await waitForDomSettled({ source: page });

  // Get the first book link
  const firstBookLink = page.locator(".product_pod h3 a").first();
  const bookTitle = await firstBookLink.getAttribute("title");
  console.log(await firstBookLink.getAttribute("href"))

  // Method 1: Navigate in the same page
  await firstBookLink.click();
  await waitForDomSettled({ source: page });
  const bookPrice = await page.locator(".price_color").first().textContent();

  // Go back to the list
  await goToUrl({ page, url: "https://books.toscrape.com/" });
  await waitForDomSettled({ source: page });

  // Method 2: Open in a new page (simulating target="_blank")
  // Create a new page manually
  const newPage = await context.newPage();
  await goToUrl({ page: newPage, url: "https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html" });
  await waitForDomSettled({ source: newPage });

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
