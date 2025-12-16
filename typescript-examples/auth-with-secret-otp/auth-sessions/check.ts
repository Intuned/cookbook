import { BrowserContext, Page } from "playwright";
import { goToUrl } from "@intuned/browser";

export default async function check(
  page: Page,
  context: BrowserContext
): Promise<boolean> {
  // Step 1: Navigate to a protected page (dashboard)
  await goToUrl({
    page,
    url: "https://sandbox.intuned.dev",
  });

  // Step 2: Check if the user menu toggle is visible
  // The user menu toggle should only be visible on the dashboard if we're logged in
  // If we were redirected to login, this element won't exist
  const userMenuToggle = page.locator("#user-menu-toggle");
  const isSessionValid = await userMenuToggle.isVisible();

  // Return true if the session is still valid (user menu is visible)
  // Return false if the session expired (we were redirected to login)
  return isSessionValid;
}
