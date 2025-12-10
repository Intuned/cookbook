import { Page, BrowserContext } from "playwright";
import { goToUrl } from "@intuned/browser";

export interface CreateAuthSessionParams {
  username: string;
  password: string;
}

export default async function* create(
  params: CreateAuthSessionParams,
  page: Page,
  context: BrowserContext
): AsyncGenerator<unknown, any, string> {
  // Step 1: Navigate to the login page
  // Wait for the page to fully load before proceeding
  await goToUrl({
    page,
    url: "https://sandbox.intuned.dev/login",
  });

  // Step 2: Find the email input field and enter the username
  // The locator finds the element with id="email-input"
  const emailInput = page.locator("#email-input");
  await emailInput.fill(params.username);

  // Step 3: Find the password input field and enter the password
  // The locator finds the element with id="password-input"
  const passwordInput = page.locator("#password-input");
  await passwordInput.fill(params.password);

  // Step 4: Click the submit button to log in
  // This will submit the login form with the credentials we just entered
  const submitButton = page.locator("#submit-button");
  await submitButton.click();

  // Step 5: Wait for the page to load after login
  // We wait for the network to be idle, indicating the page has finished loading
  await page.waitForLoadState("networkidle");

  // Step 6: Verify successful login by checking if the user menu is visible
  // If the user menu toggle is visible, it means we successfully logged in
  const userMenuToggle = page.locator("#user-menu-toggle");
  const isLoggedIn = await userMenuToggle.isVisible();

  // Return true if login was successful, false otherwise
  return isLoggedIn;
}
