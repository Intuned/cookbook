import { BrowserContext, Page } from "playwright";
import { goToUrl } from "@intuned/browser";
import { extendPayload } from "@intuned/runtime";
import { JSDOM } from "jsdom";
import { z } from "zod";
import { listSchema, Product } from "../utils/typesAndSchemas.js";

type Params = z.infer<typeof listSchema>;

function extractProducts(html: string): Product[] {
  /**
   * Extracts product info from the page HTML using JSDOM.
   * Replace selectors with appropriate ones for your target site.
   */
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const products: Product[] = [];

  // Find all product items - replace selector as needed
  const productElements = document.querySelectorAll("li.product");

  productElements.forEach((product) => {
    // Extract title - replace selector as needed
    const titleElement = product.querySelector(
      "h2.woocommerce-loop-product__title"
    );
    const title = titleElement?.textContent?.trim() || "";

    // Extract price - replace selector as needed
    const priceElement = product.querySelector("span.woocommerce-Price-amount");
    const price = priceElement?.textContent?.trim() || "";

    // Extract details URL - replace selector as needed
    const linkElement = product.querySelector("a.woocommerce-LoopProduct-link");
    const detailsUrl = linkElement?.getAttribute("href") || "";

    if (title && detailsUrl) {
      products.push({
        title,
        price,
        detailsUrl,
      });
    }
  });

  return products;
}

function getNextPageUrl(html: string): string | null {
  /**
   * Extracts the next page URL from pagination.
   * Returns null if there is no next page.
   */
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Find the next page link - replace selector as needed
  const nextLink = document.querySelector("a.next.page-numbers");

  if (nextLink) {
    return nextLink.getAttribute("href");
  }

  return null;
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  /**
   * Scrapes product listings from an e-commerce site using JSDOM.
   * Handles pagination by following "Next" page links.
   *
   * Example params:
   * {
   *   "url": "https://www.scrapingcourse.com/ecommerce/",
   *   "maxPages": 5
   * }
   *
   * This function:
   * 1. Navigates to the listing page
   * 2. Extracts product data using JSDOM
   * 3. Follows pagination links to scrape multiple pages
   * 4. Returns all products found
   */

  // Set default values
  const url = params.url;
  if (!url) {
    throw new Error("url is required in params");
  }
  const maxPages = params.maxPages ?? 10;

  console.log(`Starting scrape from: ${url}`);
  console.log(`Max pages: ${maxPages}`);

  const allProducts: Product[] = [];
  let currentUrl: string | null = url;
  let currentPage = 1;

  while (currentUrl && currentPage <= maxPages) {
    console.log(`Scraping page ${currentPage}: ${currentUrl}`);

    // Navigate to the page
    await goToUrl({ page, url: currentUrl });

    // Wait for products to load - replace selector as needed
    await page.waitForSelector("li.product");

    // Get the page HTML
    const html = await page.content();

    // Extract products using JSDOM
    const products = extractProducts(html);
    allProducts.push(...products);

    console.log(`Found ${products.length} products on page ${currentPage}`);

    // Get next page URL
    currentUrl = getNextPageUrl(html);
    currentPage += 1;
  }

  console.log(`Total products scraped: ${allProducts.length}`);

  for (const product of allProducts) {
    extendPayload({
      api: "details",
      parameters: product,
    });
  }

  return {
    products: allProducts,
    count: allProducts.length,
    pagesScraped: currentPage - 1,
  };
}
