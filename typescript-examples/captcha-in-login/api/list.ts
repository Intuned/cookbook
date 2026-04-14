import { BrowserContext, Page } from "playwright";
import { goToUrl } from "@intuned/browser";
import { extendPayload } from "@intuned/runtime";

interface Params {}

interface Product {
  name: string;
  price: string;
  details_url_item: string;
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
): Promise<{ products: Product[] }> {
  /**
   * Scrapes products from a product grid page.
   * Extracts name, price, and detail URL for each product.
   *
   * Example params:
   * {
   *   "url": "https://scrapingcourse.com/dashboard"
   * }
   */

  await goToUrl({
    page,
    url: "https://scrapingcourse.com/dashboard",
  });

  const products: Product[] = [];
  const items = page.locator(".product-item");
  const count = await items.count();

  for (let i = 0; i < count; i++) {
    const item = items.nth(i);
    const name = (await item.locator(".product-name").textContent()) || "";
    const price = (await item.locator(".product-price").textContent()) || "";
    const details_url = (await item.locator("a").getAttribute("href")) || "";

    products.push({
      name: name.trim(),
      price: price.trim(),
      details_url_item: details_url,
    });
  }

  console.log(`Total products scraped: ${products.length}`);

  for (const product of products) {
    extendPayload({
      api: "details",
      parameters: product,
    });
  }

  return { products };
}
