import { BrowserContext, Page } from "playwright";

/**
 * Page Evaluate
 *
 * Demonstrates executing JavaScript in the browser context:
 * - Running custom JavaScript
 * - Accessing DOM directly
 * - Extracting complex data
 * - Manipulating the page
 */

interface Params {}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  await page.goto("https://books.toscrape.com/");
  await page.waitForLoadState("networkidle");

  // Simple evaluate - scroll to bottom
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });

  // Get page dimensions
  const dimensions = await page.evaluate(() => {
    return {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
      scrollHeight: document.body.scrollHeight,
    };
  });

  // Extract data using JavaScript
  const productData = await page.evaluate(() => {
    const products = Array.from(document.querySelectorAll(".product_pod"));
    return products.slice(0, 5).map((product) => {
      const titleEl = product.querySelector("h3 a");
      const priceEl = product.querySelector(".price_color");
      return {
        title: titleEl?.getAttribute("title") ?? null,
        price: priceEl?.textContent ?? null,
      };
    });
  });

  // Pass arguments to evaluate
  const greeting = await page.evaluate((name) => {
    return `Hello, ${name}! Current URL is ${window.location.href}`;
  }, "Playwright User");

  // Manipulate DOM - hide all images
  await page.evaluate(() => {
    document.querySelectorAll("img").forEach((img) => {
      (img as HTMLElement).style.visibility = "hidden";
    });
  });

  // Check if images are hidden
  const firstImageVisible = await page.locator("img").first().isVisible();

  // Restore images
  await page.evaluate(() => {
    document.querySelectorAll("img").forEach((img) => {
      (img as HTMLElement).style.visibility = "visible";
    });
  });

  return {
    dimensions,
    productData,
    greeting,
    imagesWereHidden: !firstImageVisible,
  };
}
