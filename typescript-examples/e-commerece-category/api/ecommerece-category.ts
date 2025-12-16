import { Page, BrowserContext } from "playwright";
import { extendPayload } from "@intuned/runtime";
import { goToUrl } from "@intuned/browser";
import { z } from "zod";
import { categorySchema, Category } from "../utils/typesAndSchemas.js";

type Params = z.infer<typeof categorySchema>;

/**
 * Handles cookie consent banner if present.
 * Replace the selector with the appropriate one for your store.
 */
async function handleCookies(page: Page): Promise<void> {
  try {
    // Replace selector with appropriate one for your store
    await page.waitForSelector("#onetrust-accept-btn-handler", {
      timeout: 5000,
    });
    await page.click("#onetrust-accept-btn-handler");
    console.log("Accepted cookies");
    await page.waitForTimeout(1000);
  } catch {
    // Cookie banner not present or already accepted
  }
}

/**
 * Extracts category links from the main menu.
 * Replace selectors with appropriate ones for your store.
 */
async function extractCategories(
  page: Page,
  storeUrl: string
): Promise<Category[]> {
  const categories: Category[] = [];

  // Replace selector with appropriate one for your store's menu
  const menuSelector = ".has-submenu a.main-menu__link";
  const links = await page.$$(menuSelector);

  for (const link of links) {
    const href = await link.getAttribute("href");
    const name = await link.innerText();

    if (href) {
      // Make sure href is absolute URL
      const categoryUrl = new URL(href, storeUrl).toString();
      const categoryName = name?.trim() || "";

      categories.push({
        category_name: categoryName,
        category_url: categoryUrl,
      });
    }
  }

  return categories;
}

/**
 * Scrapes all category links from an e-commerce store's main menu.
 * Each category will be scraped separately using the extendPayload mechanism.
 *
 * Example params:
 * {
 *   "store_url": "https://www.example-store.com/"
 * }
 *
 * This function collects category metadata (name, url) from the main menu
 * and then uses extendPayload to trigger individual scrapes for each category's products.
 */
async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
): Promise<{ categories: Category[] }> {
  await page.setViewportSize({ width: 1280, height: 800 });

  if (!params || !params.store_url) {
    throw new Error("store_url is required in params");
  }

  const storeUrl = params.store_url.replace(/\/$/, "");

  // Parse and validate the store URL
  try {
    new URL(storeUrl);
  } catch {
    throw new Error(`Invalid store URL: ${storeUrl}`);
  }

  console.log(`Scraping categories from: ${storeUrl}`);

  // Navigate to the store home page
  await goToUrl({ page, url: storeUrl });

  // Handle cookie consent banner
  await handleCookies(page);

  // Wait for the main menu to be present
  // Replace selector with appropriate one for your store
  await page.waitForSelector(".has-submenu a.main-menu__link");

  // Extract all categories from the menu
  const allCategories = await extractCategories(page, storeUrl);

  console.log(`Total categories found: ${allCategories.length}`);

  // Enqueue each category for further scraping
  for (const category of allCategories) {
    extendPayload({
      api: "ecommerece-list",
      parameters: category,
    });
  }

  return { categories: allCategories };
}

export default handler;
