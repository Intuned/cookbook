import { BrowserContext, Page } from "playwright";
import { extendPayload } from "@intuned/runtime";
import { goToUrl } from "@intuned/browser";

import { ListInputSchema, listSchema } from "../utils/typesAndSchemas";

type Params = ListInputSchema;

interface Product {
  name: string;
  detailsUrl: string;
}

async function hasNextPage(page: Page): Promise<boolean> {
  // Look for the "next" button in the pagination
  // The next button has class "next page-numbers" and is a link (not disabled)
  const nextButton = page.locator("a.next.page-numbers");

  // Check if the next button exists on the page
  // If it exists, there is a next page available
  const count = await nextButton.count();

  return count > 0;
}

async function extractProductsFromPage(page: Page): Promise<Product[]> {
  // Wait for the product list container to be visible on the page
  // This ensures the page has fully loaded before we try to scrape
  const productsContainer = page.locator("#product-list");
  await productsContainer.waitFor({ state: "visible" });

  // Find all product items within the container
  // Each product is represented by an <li> element with data-products="item"
  const productElements = await productsContainer
    .locator("li[data-products='item']")
    .all();

  // Array to store all extracted product data
  const products: Product[] = [];

  // Loop through each product element to extract its information
  for (const productElement of productElements) {
    try {
      // Extract the product name from the h2 heading
      const nameElement = productElement.locator("h2.product-name");
      const name = await nameElement.textContent();

      // Extract the product details URL from the main product link
      const linkElement = productElement.locator(
        "a.woocommerce-LoopProduct-link"
      );
      const detailsUrl = await linkElement.getAttribute("href");

      // Add the product to products list
      if (name && detailsUrl) {
        const product = {
          name: name.trim(),
          detailsUrl: detailsUrl.trim(),
        };

        products.push(product);
        // extend the payload to trigger the details API
        extendPayload({
          api: "details",
          parameters: product,
        });
      }
    } catch (error) {
      // If extraction fails for a single product, log the error but continue with others
      console.error("Failed to extract product data:", error);
      continue;
    }
  }

  return products;
}

async function navigateToNextPage(page: Page): Promise<void> {
  // Click the next page button to navigate to the next page
  // .first() because this locator resolves to multiple elements on the page
  const nextButton = page.locator("a.next.page-numbers").first();
  await nextButton.click();

  // Wait for the page to load after clicking next
  // Wait for the product list to be visible again
  await page.locator("#product-list").waitFor({ state: "visible" });
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
): Promise<Product[]> {
  // Validate params using Zod schema
  const validatedParams = listSchema.parse(params);

  // Get the page limit from params, default to 50 if not provided
  const pageLimit = validatedParams.limit || 50;

  // Navigate to the e-commerce website
  await goToUrl({
    page: page,
    url: "https://www.scrapingcourse.com/ecommerce/",
  });

  // Array to store all products from all pages
  let allProducts: Product[] = [];
  let currentPage = 1;

  // Loop through all pages until there are no more pages or limit is reached
  while (true) {
    console.log(`Scraping page ${currentPage}...`);

    // Extract all products from the current page
    const products = await extractProductsFromPage(page);

    // Add the products from this page to our complete list
    allProducts = allProducts.concat(products);

    // Check if we've reached the page limit
    if (currentPage >= pageLimit) {
      console.log(`Reached page limit of ${pageLimit} pages`);
      break;
    }

    // Check if there's a next page available
    const hasNext = await hasNextPage(page);

    if (!hasNext) {
      // No more pages - exit the loop
      console.log("No more pages to scrape");
      break;
    }

    // Navigate to the next page
    await navigateToNextPage(page);

    currentPage++;
  }

  // Return the scraped products
  return allProducts;
}
