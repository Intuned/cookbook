import { BrowserContext, Page } from "playwright-core";

interface Product {
  name: string;
  price: string;
}

// Extract products from the current page
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

// Check if next page exists
async function hasNextPage(page: Page): Promise<boolean> {
  const nextButton = page.locator('a:has-text("Next page")');
  return (await nextButton.count()) > 0;
}

// Navigate to the next page
async function goToNextPage(page: Page): Promise<void> {
  const nextButton = page.locator('a:has-text("Next page")');
  await nextButton.click();
  await page.waitForLoadState("networkidle");
}

export default async function handler(
  params: { maxPages?: number },
  page: Page,
  context: BrowserContext
) {
  const maxPages = params.maxPages ?? 5;
  await page.goto("https://www.scrapingcourse.com/pagination");

  const allProducts: Product[] = [];
  let currentPage = 0;

  while (currentPage < maxPages) {
    // Extract data from current page
    const results = await extractDataFromCurrentPage(page);
    console.log(
      `Extracted ${results.length} results from page ${currentPage + 1}`
    );
    allProducts.push(...results);

    // Check if there's a next page
    const canContinue = await hasNextPage(page);
    if (!canContinue) {
      console.log("No more pages available.");
      break;
    }

    currentPage++;
    if (currentPage >= maxPages) {
      break;
    }

    // Navigate to next page
    await goToNextPage(page);
  }

  return allProducts;
}

