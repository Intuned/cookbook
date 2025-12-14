import { Page, BrowserContext } from "playwright";
import { extendPayload } from "@intuned/runtime";
import { goToUrl, clickUntilExhausted } from "@intuned/browser";
import { z } from "zod";
import { listSchema, Product } from "../utils/typesAndSchemas.js";

type Params = z.infer<typeof listSchema>;

/**
 * Handle country/language modal if present.
 * Replace the selector with the appropriate one for your store.
 */
async function handleModal(page: Page): Promise<void> {
  try {
    const modalBtn = await page.$(
      "#countrySwitcherModal .btn.btn-primary.dark-theme.full"
    );
    if (modalBtn) {
      await modalBtn.click();
    }
  } catch {
    // Modal not present
  }
}

/**
 * Loads all products by clicking the "Load More" button until exhausted.
 * Replace the selectors with the appropriate ones for your store.
 */
async function loadAllProducts(page: Page): Promise<void> {
  // Replace "button.more" with the appropriate selector for your store's load more button
  const loadMoreButton = page.locator("button.more");
  // Replace with your product container selector
  const productContainer = page.locator(".product-grid");

  await clickUntilExhausted({
    page,
    buttonLocator: loadMoreButton,
    containerLocator: productContainer,
    maxClicks: 50,
    clickDelay: 1.0,
  });
}

/**
 * Extracts product info from the loaded page.
 * Replace the selectors with the appropriate ones for your store.
 */
async function extractProducts(
  page: Page,
  categoryUrl: string
): Promise<Product[]> {
  const products: Product[] = [];

  // Replace ".product-tile__link" with the appropriate selector for your store
  const productLinks = await page.$$(".product-tile__link");

  for (const link of productLinks) {
    const href = await link.getAttribute("href");

    // Extract title - replace with appropriate selector
    const titleElement = await link.$(".product-tile__name");
    const name = titleElement ? await titleElement.innerText() : "";

    // Extract price - replace with appropriate selector
    const priceElement = await link.$(".product-tile__price .current");
    const price = priceElement ? await priceElement.innerText() : "";

    if (href) {
      const detailsUrl = new URL(href, categoryUrl).toString();
      products.push({
        name: name?.trim() || "",
        price: price?.trim() || "",
        details_url: detailsUrl,
      });
    }
  }

  return products;
}

/**
 * Navigates to URL and handles cookies.
 */
async function findEntity(page: Page, url: string): Promise<void> {
  await goToUrl({ page, url });
  try {
    await page.waitForSelector("#onetrust-accept-btn-handler", {
      timeout: 5000,
    });
    await page.click("#onetrust-accept-btn-handler");
    console.log("Accepted cookies");
    await page.waitForTimeout(1000);
  } catch {
    // Cookie banner not present
  }
}

/**
 * Scrapes all products from a category page using "Load More" pagination.
 * Each product's details will be scraped separately using the extendPayload mechanism.
 *
 * Example params:
 * {
 *   "category_name": "Shoes",
 *   "category_url": "https://www.example-store.com/shoes"
 * }
 *
 * This function loads all products by clicking the "Load More" button,
 * then extracts product metadata (name, price, details_url) and uses
 * extendPayload to trigger individual scrapes for each product's details.
 */
async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
): Promise<{ category: string; products: Product[] }> {
  await page.setViewportSize({ width: 1280, height: 800 });

  if (!params || !params.category_url) {
    throw new Error("category_url is required in params");
  }

  const categoryUrl = params.category_url;
  const categoryName = params.category_name || "";

  console.log(`Scraping category: ${categoryName}`);
  console.log(`Category URL: ${categoryUrl}`);

  // Navigate to the category page
  await findEntity(page, categoryUrl);

  // Handle country/language modal if present
  await handleModal(page);

  // Wait for product grid to load
  // Replace this selector with the appropriate one for your store
  await page.waitForSelector(".product-grid");

  // Load all products by clicking "Load More" button
  await loadAllProducts(page);

  // Extract all products from the page
  const allProducts = await extractProducts(page, categoryUrl);

  console.log(`Total products found: ${allProducts.length}`);

  // Enqueue each product for detailed scraping
  for (const product of allProducts) {
    extendPayload({
      api: "ecommerece-details",
      parameters: product,
    });
  }

  return { category: categoryName, products: allProducts };
}

export default handler;
