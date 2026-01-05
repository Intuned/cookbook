import { BrowserContext, Page } from "playwright";
import { goToUrl } from "@intuned/browser";
import { JSDOM } from "jsdom";
import { z } from "zod";

import { detailsSchema, ProductDetails } from "../utils/typesAndSchemas.js";

type Params = z.infer<typeof detailsSchema>;

function extractProductDetails(html: string, params: Params): ProductDetails {
  /**
   * Extracts detailed product information from the page HTML using JSDOM.
   * Replace selectors with appropriate ones for your target site.
   */
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Extract description - replace selector as needed
  const descriptionElement = document.querySelector("#tab-description p");
  const description = descriptionElement?.textContent?.trim() || "";

  // Extract SKU - replace selector as needed
  const skuElement = document.querySelector(".sku");
  const sku = skuElement?.textContent?.trim() || "";

  // Extract category - replace selector as needed
  const categoryElement = document.querySelector(".posted_in a");
  const category = categoryElement?.textContent?.trim() || "";

  // Extract sizes from select options - replace selector as needed
  const sizeOptions = document.querySelectorAll("#size option");
  const sizes: string[] = [];
  sizeOptions.forEach((opt) => {
    const value = opt.getAttribute("value");
    if (value && value !== "") {
      sizes.push(opt.textContent?.trim() || "");
    }
  });

  // Extract colors from select options - replace selector as needed
  const colorOptions = document.querySelectorAll("#color option");
  const colors: string[] = [];
  colorOptions.forEach((opt) => {
    const value = opt.getAttribute("value");
    if (value && value !== "") {
      colors.push(opt.textContent?.trim() || "");
    }
  });

  // Extract product images - replace selector as needed
  const imageElements = document.querySelectorAll(
    ".woocommerce-product-gallery__image img"
      );
  const images: string[] = [];
  imageElements.forEach((img) => {
    const src = img.getAttribute("src");
    if (src) {
      images.push(src);
    }
  });

  return {
    title: params.title,
    price: params.price,
    sourceUrl: params.detailsUrl,
    description,
    sku,
    category,
    sizes,
    colors,
    images,
  };
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
): Promise<ProductDetails> {
  /**
   * Scrapes product details from a product page using JSDOM.
   * This API is called via extendPayload from the list API.
   *
   * Expected params (from list.ts extendPayload):
   * {
   *   "title": "Product Name",
   *   "price": "$19.99",
   *   "detailsUrl": "https://www.scrapingcourse.com/ecommerce/product/example"
   * }
   *
   * This function:
   * 1. Navigates to the product details page
   * 2. Extracts additional product information using JSDOM
   * 3. Returns complete product details
   */

  // Validate required params
  if (!params.detailsUrl) {
    throw new Error("detailsUrl is required in params");
  }

  const detailsUrl = params.detailsUrl;
  console.log(`Scraping product details from: ${detailsUrl}`);

  // Navigate to the product page
  await goToUrl({ page, url: detailsUrl });

  // Wait for the product content to load - replace selector as needed
  await page.waitForSelector(".product");

  // Get the page HTML
  const html = await page.content();

  // Extract product details using JSDOM
  const productDetails = extractProductDetails(html, params);

  console.log(`Successfully scraped details for: ${productDetails.title}`);
  return productDetails;
}
