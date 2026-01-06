import { BrowserContext, Page } from "playwright";
import { scrollToLoadContent } from "@intuned/browser";

interface Product {
  name: string;
  price: string;
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
  params: { maxScrolls?: number },
  page: Page,
  context: BrowserContext
) {
  await page.goto("https://www.scrapingcourse.com/infinite-scrolling");

  // Scroll to load all content
  await scrollToLoadContent({
    source: page,
    maxScrolls: params.maxScrolls ?? 50,
  });

  // Extract all products after content is loaded
  const products = await extractProducts(page);
  console.log(`Extracted ${products.length} products`);

  return products;
}