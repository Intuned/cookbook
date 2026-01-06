import { BrowserContext, Page, Locator } from "playwright";

interface Product {
  name: string;
  price: string;
}

// Click button until it disappears or max clicks reached
async function clickUntilExhausted(
  buttonLocator: Locator,
  maxClicks: number,
  page: Page
): Promise<void> {
  let clicks = 0;

  while (clicks < maxClicks) {
    await page.waitForTimeout(3000)
    const isVisible = await buttonLocator.isVisible();
    if (!isVisible) {
      break;
    }

    await buttonLocator.click();
    clicks++;
  }
}

// Extract products from the page
async function extractProducts(page: Page): Promise<Product[]> {
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

export default async function handler(
  params: { maxClicks?: number },
  page: Page,
  context: BrowserContext
) {
  await page.goto("https://www.scrapingcourse.com/button-click");

  // Locate the "Load More" button
  const loadMoreButton = page.locator("button:has-text('Load More')");

  // Click until button disappears or max clicks reached

  await clickUntilExhausted(loadMoreButton, params.maxClicks ?? 50, page);


  // Extract all products after content is loaded
  const products = await extractProducts(page);
  console.log(`Extracted ${products.length} products`);

  return products;
}