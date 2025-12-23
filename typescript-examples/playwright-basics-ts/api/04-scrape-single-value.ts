import { BrowserContext, Page } from "playwright";

/**
 * Scrape Single Value
 *
 * Demonstrates extracting individual values from elements:
 * - textContent / innerText
 * - getAttribute
 * - isVisible / isHidden
 */

interface Params {}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  await page.goto("https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html");
  await page.waitForLoadState("networkidle");

  // Extract text content
  const title = await page.locator(".product_main h1").textContent();

  // Extract inner text (visible text only)
  const price = await page.locator(".product_main .price_color").innerText();

  // Extract attribute value
  const imageUrl = await page.locator("#product_gallery img").getAttribute("src");

  // Extract multiple attributes
  const productDescription = await page.locator("#product_description + p").textContent();

  // Check element state - verify navigation breadcrumb is visible
  const breadcrumbVisible = await page.locator(".breadcrumb").isVisible();

  // Get stock info from table
  const stockInfo = await page.locator("table.table tr").filter({
    hasText: "Availability"
  }).locator("td").textContent();

  return {
    title: title?.trim(),
    price,
    imageUrl,
    description: productDescription?.trim().substring(0, 100) + "...",
    breadcrumbVisible,
    stockInfo: stockInfo?.trim(),
  };
}
