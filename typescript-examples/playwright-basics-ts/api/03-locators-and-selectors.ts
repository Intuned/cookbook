import { BrowserContext, Page } from "playwright";

/**
 * Locators and Selectors
 *
 * Demonstrates different ways to find elements:
 * - CSS selectors
 * - XPath selectors
 * - Built-in semantic locators (getByRole, getByText, etc.)
 * - Chaining and filtering
 */

interface Params {}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  await page.goto("https://books.toscrape.com/");
  await page.waitForLoadState("networkidle");

  // CSS Selectors
  const cssLocator = page.locator(".product_pod h3 a");
  const cssCount = await cssLocator.count();

  // XPath Selectors
  const xpathLocator = page.locator("//article[@class='product_pod']//h3/a");
  const xpathCount = await xpathLocator.count();

  // Built-in semantic locators
  // getByRole - find by ARIA role
  const nextButton = page.getByRole("link", { name: "next" });
  const hasNextButton = await nextButton.isVisible();

  // getByText - find by visible text
  const travelCategory = page.getByText("Travel", { exact: true });
  const hasTravelCategory = await travelCategory.isVisible();

  // Chaining and filtering
  const firstProduct = page.locator(".product_pod").first();
  const firstProductTitle = await firstProduct.locator("h3 a").getAttribute("title");

  // Using nth() to get specific element
  const thirdProduct = page.locator(".product_pod").nth(2);
  const thirdProductTitle = await thirdProduct.locator("h3 a").getAttribute("title");

  // Filter locators
  const inStockProducts = page.locator(".product_pod").filter({
    has: page.locator(".instock"),
  });
  const inStockCount = await inStockProducts.count();

  return {
    cssCount,
    xpathCount,
    hasNextButton,
    hasTravelCategory,
    firstProductTitle,
    thirdProductTitle,
    inStockCount,
  };
}
