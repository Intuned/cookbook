import { BrowserContext, Page } from "playwright";

export default async function check(
  page: Page,
  context: BrowserContext
): Promise<boolean> {
  // Step 1: Navigate to a protected page 
  // If the session is invalid, the website will typically redirect to the login page
  await page.goto("https://demo.openimis.org/front/home", {
    timeout: 30_000,
  });
  await page.waitForTimeout(10000)
  // Step 2: Check if the welcome message is still there
  // If we were redirected to login, this element won't exist
  const userMenuToggle = page.locator("h4.MuiTypography-h4");
  const isSessionValid = await userMenuToggle.isVisible();

  // Return true if the session is still valid 
  // Return false if the session expired (we were redirected to login)
  return isSessionValid;
}
