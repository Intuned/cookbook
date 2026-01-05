import { BrowserContext, Page } from "playwright";

/**
 * Scrape List
 *
 * Demonstrates extracting data from a list of elements
 * using count() and nth() to iterate.
 */

interface Params {
  maxItems?: number;
}

interface Product {
  title: string | null;
  price: string | null;
  rating: string | null;
  inStock: boolean;
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  await page.goto("https://books.toscrape.com/");
  await page.waitForLoadState("networkidle");

  const products: Product[] = [];
  const productCards = page.locator(".product_pod");
  const totalCount = await productCards.count();
  const maxItems = params.maxItems ?? totalCount;

  for (let i = 0; i < Math.min(totalCount, maxItems); i++) {
    const card = productCards.nth(i);

    // Extract title from the link's title attribute
    const title = await card.locator("h3 a").getAttribute("title");

    // Extract price
    const price = await card.locator(".price_color").textContent();

    // Extract rating from class (e.g., "star-rating Three")
    const ratingClass = await card.locator(".star-rating").getAttribute("class");
    const rating = ratingClass?.split(" ").pop() ?? null;

    // Check if in stock
    const inStock = await card.locator(".instock").isVisible();

    products.push({
      title,
      price: price?.trim() ?? null,
      rating,
      inStock,
    });
  }

  return {
    totalAvailable: totalCount,
    scraped: products.length,
    products,
  };
}
