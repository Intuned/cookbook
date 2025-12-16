import { BrowserContext, Page } from "playwright";
import { goToUrl } from "@intuned/browser";

export default async function check(
  page: Page,
  context: BrowserContext
): Promise<boolean> {
  // Step 1: Navigate to a protected page (dashboard)
  await goToUrl({
    page,
    url: "https://www.scrapingcourse.com/dashboard",
  });

  // Step 2: Check if the products grid is visible
  // The products grid should only be visible on the dashboard if we're logged in
  // If we were redirected to login, this element won't exist
  const productsGrid = page.locator("#product-grid");
  const isSessionValid = await productsGrid.isVisible();

  // Return true if the session is still valid (products grid is visible)
  // Return false if the session expired (we were redirected to login)
  return isSessionValid;
}
