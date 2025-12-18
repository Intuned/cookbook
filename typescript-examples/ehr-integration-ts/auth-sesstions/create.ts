import { Page, BrowserContext } from "playwright";

import { goToUrl } from "@intuned/browser";
import { RunError } from "@intuned/runtime";



type Params = z.infer<typeof createAuthSessionParams>;

export default async function* create(
  params: Params,
  page: Page,
  context: BrowserContext
): AsyncGenerator<unknown, boolean, string> {
  const validatedParams = createAuthSessionParams.safeParse(params);

  if (!validatedParams.success) {
    throw new RunError("Params with username and password are required");
  }

  const { username, password } = validatedParams.data;

  // Step 1: Navigate to the login page
  await goToUrl(page, "https://demo.openimis.org/front/login", {
    waitUntil: "networkidle",
    timeout: 30_000,
  });

  // Step 2: Fill username
  const usernameInput = page.locator("input[type='text']");
  await usernameInput.fill(username);

  // Step 3: Fill password
  const passwordInput = page.locator("input[type='password']");
  await passwordInput.fill(password);

  // Step 4: Submit login form
  const submitButton = page.locator("button[type=submit]");
  await submitButton.click();

  // Step 5: Wait for page to finish loading
  await page.waitForLoadState("networkidle");

  // Step 6: Verify successful login
  const userMenuToggle = page.locator("h4.MuiTypography-h4");
  const isLoggedIn = await userMenuToggle.isVisible();

  // Step 7: Small delay to ensure session is established
  await page.waitForTimeout(2000);

  return isLoggedIn;
}