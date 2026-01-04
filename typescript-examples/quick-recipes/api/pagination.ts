import { BrowserContext, Page } from "playwright";

interface Params {
  maxPages?: number;
}

interface Product {
  name: string;
  price: string;
}

async function extractDataFromCurrentPage(page: Page): Promise<Product[]> {
  const results: Product[] = [];
  const productCards = page.locator(".product-item");
  const count = await productCards.count();

  for (let i = 0; i < count; i++) {
    const card = productCards.nth(i);
    const name = await card.locator(".product-name").textContent();
    const price = await card.locator(".product-price").textContent();

    if (name && price) {
      results.push({
        name: name.trim(),
        price: price.trim(),
      });
    }
  }

  return results;
}

// Check if a next page exists
async function hasNextPage(page: Page): Promise<boolean> {
  const nextButton = page.locator('a:has-text("Next page")');
  return (await nextButton.count()) > 0;
}

// Navigate to the next page and wait for network idle
async function goToNextPage(page: Page): Promise<void> {
  const nextButton = page.locator('a:has-text("Next page")');
  await nextButton.click();
  await page.waitForLoadState("networkidle");
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  const maxPages = params.maxPages ?? 5;
  // Start on the first pagination page
  await page.goto("https://www.scrapingcourse.com/pagination");

  const allProducts: Product[] = [];
  let currentPage = 0;

  while (currentPage < maxPages) {
    // Extract data from the current page
    const results = await extractDataFromCurrentPage(page);
    console.log(`Extracted ${results.length} results from page ${currentPage + 1}`);
    allProducts.push(...results);

    // Stop if no further pages
    const canContinue = await hasNextPage(page);
    if (!canContinue) {
      console.log("No more pages available.");
      break;
    }

    currentPage++;
    if (currentPage >= maxPages) {
      break;
    }

    // Move to the next page
    await goToNextPage(page);
  }

  return allProducts;
}
