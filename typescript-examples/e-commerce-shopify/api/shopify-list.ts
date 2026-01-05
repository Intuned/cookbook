import { Page, BrowserContext } from "playwright";
import { extendPayload } from "@intuned/runtime";
import { goToUrl } from "@intuned/browser";
import { shopifyListSchema, Product } from "../utils/typesAndSchemas.js";
import { z } from "zod";

type Params = z.infer<typeof shopifyListSchema>;

const LIMIT = 250;

/**
 * Extracts product info from JSON response
 */
function extractProducts(data: any, productBaseUrl: string): Product[] {
  const products: Product[] = [];

  for (const product of data.products || []) {
    const productHandle = product.handle || "";
    products.push({
      name: product.title || "",
      vendor: product.vendor || "",
      product_type: product.product_type || "",
      tags: product.tags || [],
      details_url: `${productBaseUrl}${productHandle}`,
    });
  }

  return products;
}

/**
 * Scrapes all products from any Shopify store using the JSON API with pagination.
 * Each product's details will be scraped separately using the extend_payload mechanism.
 *
 * Example params:
 * {
 *   "store_url": "https://the-outrage.com"
 * }
 *
 * This function collects product metadata (name, vendor, type, tags, details_url)
 * and then uses extendPayload to trigger individual scrapes for each product's details.
 */
async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
): Promise<{ products: Product[] }> {
  if (!params || !params.store_url) {
    throw new Error("store_url is required in params");
  }

  const storeUrl = params.store_url.replace(/\/$/, "");

  // Parse and validate the store URL
  try {
    new URL(storeUrl);
  } catch (error) {
    throw new Error(`Invalid store URL: ${storeUrl}`);
  }

  // Construct the base URLs
  const baseUrl = `${storeUrl}/products.json`;
  const productBaseUrl = `${storeUrl}/products/`;

  console.log(`Shopify store: ${storeUrl}`);
  console.log(`Products API: ${baseUrl}`);

  // Navigate to the store home page
  await goToUrl({ page, url: storeUrl });

  const maxPages = params.maxPages ?? 10;

  const allProducts: Product[] = [];
  let currentPage = 1;

  while (currentPage <= maxPages) {
    const url = `${baseUrl}?limit=${LIMIT}&page=${currentPage}`;
    console.log(`Fetching page ${currentPage}: ${url}`);

    const response = await page.request.get(url);
    const data = await response.json();

    const products = extractProducts(data, productBaseUrl);

    if (products.length === 0) {
      console.log("No more products found");
      break;
    }

    allProducts.push(...products);
    console.log(
      `Extracted ${products.length} products from page ${currentPage}`
    );

    currentPage++;
  }

  console.log(`Total products scraped: ${allProducts.length}`);

  // Extend payload for each product to scrape details
  for (const product of allProducts) {
    extendPayload({
      api: "shopify-details",
      parameters: product,
    });
  }

  return { products: allProducts };
}

export default handler;
