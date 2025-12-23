import { BrowserContext, Page } from "playwright";
import { waitForDomSettled, withNetworkSettledWait } from "@intuned/browser";

/**
 * Wait Strategies
 *
 * Demonstrates different ways to wait for page content to load:
 * - Playwright: waitForLoadState, waitForSelector
 * - Intuned SDK: waitForDomSettled, withNetworkSettledWait
 */

interface Params {}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  await page.goto("https://books.toscrape.com/");

  // ============================================
  // Playwright built-in wait strategies
  // ============================================

  // Wait for different load states
  // 'load' - full page load including images (default)
  // 'domcontentloaded' - DOM is ready
  // 'networkidle' - no network activity for 500ms
  await page.waitForLoadState("networkidle");

  // Wait for a specific element to appear
  await page.waitForSelector(".product_pod h3 a", {
    state: "visible",
    timeout: 5000,
  });

  // Wait for an element to disappear (useful for loading spinners)
  // await page.waitForSelector(".loading-spinner", { state: "hidden" });

  // Get the count of products to verify page loaded
  const productCount = await page.locator(".product_pod").count();

  // ============================================
  // Intuned SDK wait helpers
  // ============================================

  // waitForDomSettled - waits until DOM stops changing
  // Useful after actions that trigger dynamic content updates
  await waitForDomSettled({
    source: page,
    settleDurationMs: 500, // How long DOM must be stable
    timeoutInMs: 10000,
  });

  // withNetworkSettledWait - wraps an action and waits for network to settle
  // Useful for clicks that trigger API calls
  await withNetworkSettledWait(
    async (page: Page) => {
      // Click on a category - this triggers network requests
      await page.locator('a[href*="travel"]').click();
    },
    {
      page,
      timeoutInMs: 10000,
      maxInflightRequests: 0, // Wait until all requests complete
    }
  );

  // Verify we navigated to the category page
  const categoryTitle = await page.locator(".page-header h1").textContent();

  return {
    message: "All wait strategies demonstrated successfully",
    productCount,
    categoryTitle: categoryTitle?.trim(),
  };
}
