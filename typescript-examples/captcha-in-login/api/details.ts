import { BrowserContext, Page } from "playwright";
import { goToUrl } from "@intuned/browser";

interface Params {
  name: string;
  price: string;
  details_url_item: string;
}

interface ProductDetails {
  name: string;
  price: string;
  sku: string;
  category: string;
  short_description: string;
  full_description: string;
  image_url: string;
  sizes: string[];
  colors: string[];
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
): Promise<ProductDetails> {
  /**
   * Scrapes product details from a WooCommerce product page.
   *
   * Example params:
   * {
   *   "name": "Chaz Kangeroo Hoodie",
   *   "price": "$52",
   *   "details_url_item": "https://scrapingcourse.com/ecommerce/product/chaz-kangeroo-hoodie"
   * }
   */
  if (!params || !params.details_url_item) {
    throw new Error("details_url_item is required in params");
  }

  const url = params.details_url_item;
  console.log(`Navigating to: ${url}`);

  await goToUrl({ page, url });

  // Basic info
  const name = (await page.locator("h1.product_title").textContent()) || "";
  const price =
    (await page.locator(".price .product-price").first().textContent()) || "";
  const sku = (await page.locator(".sku").textContent()) || "";
  const category = (await page.locator(".posted_in a").textContent()) || "";

  // Descriptions
  const short_desc =
    (await page
      .locator(".woocommerce-product-details__short-description p")
      .textContent()) || "";

  const full_desc_parts: string[] = [];
  const full_desc_locator = page.locator("#tab-description p");
  const count = await full_desc_locator.count();
  for (let i = 0; i < count; i++) {
    const text = await full_desc_locator.nth(i).textContent();
    if (text) {
      full_desc_parts.push(text.trim());
    }
  }
  const full_description = full_desc_parts.join("\n");

  // Image
  const image_url =
    (await page
      .locator(".woocommerce-product-gallery__image a")
      .first()
      .getAttribute("href")) || "";

  // Sizes (skip "Choose an option")
  const sizes: string[] = [];
  const size_options = page.locator("#size option");
  const size_count = await size_options.count();
  for (let i = 0; i < size_count; i++) {
    const value = await size_options.nth(i).getAttribute("value");
    if (value) {
      sizes.push(value);
    }
  }

  // Colors (skip "Choose an option")
  const colors: string[] = [];
  const color_options = page.locator("#color option");
  const color_count = await color_options.count();
  for (let i = 0; i < color_count; i++) {
    const value = await color_options.nth(i).getAttribute("value");
    if (value) {
      colors.push(value);
    }
  }

  const product: ProductDetails = {
    name: name.trim(),
    price: price.trim(),
    sku: sku.trim(),
    category: category.trim(),
    short_description: short_desc.trim(),
    full_description,
    image_url,
    sizes,
    colors,
  };

  console.log(`Scraped product: ${product.name}`);

  return product;
}
