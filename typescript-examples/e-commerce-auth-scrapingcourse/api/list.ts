import { BrowserContext, Page } from "playwright";
import { extendPayload } from "@intuned/runtime";
import { goToUrl } from "@intuned/browser";

import { ListInputSchema, listSchema } from "../utils/typeAndSchemas";

type Params = ListInputSchema;

interface Product {
  name: string;
  detailsUrl: string;
}

async function extractProductsFromPage(page: Page): Promise<Product[]> {
  // Wait for the product grid to be visible
  // This ensures the page has loaded before we try to extract data
  const productGrid = page.locator("#product-grid");
  await productGrid.waitFor({ state: "visible" });

  // Find all product items within the grid
  // Each product is contained in a div with class "product-item"
  const productItems = await productGrid.locator(".product-item").all();

  // Array to store all extracted product data
  const products: Product[] = [];

  for (const productItem of productItems) {
    try {
      // Extract the product name
      const nameElement = productItem.locator(".product-name");
      const name = await nameElement.textContent();

      // Extract the product detail page URL
      const linkElement = productItem.locator("a");
      const productUrl = await linkElement.getAttribute("href");

      // Only add the product if all required fields were found
      if (name && productUrl) {
        const product = {
          name: name.trim(),
          detailsUrl: productUrl.trim(),
        };

        products.push(product);
        // extend the payload to trigger the details API
        extendPayload({
          api: "details",
          parameters: product,
        });
      }
    } catch (error) {
      // If extraction fails for a single product, log it but continue with others
      console.error("Failed to extract product data:", error);
      continue;
    }
  }

  return products;
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
): Promise<Product[]> {
  // Validate input parameters using schema
  const validatedParams = listSchema.parse(params);

  // Navigate to the dashboard page
  await goToUrl({
    page: page,
    url: "https://www.scrapingcourse.com/dashboard",
  });

  // Extract all product details from the page
  const products = await extractProductsFromPage(page);

  // Return all extracted products
  return products;
}
