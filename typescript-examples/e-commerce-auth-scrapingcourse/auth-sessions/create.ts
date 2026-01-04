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
  await goToUrl({
    page,
    url: "https://www.scrapingcourse.com/login",
  });

  // Step 2: Find the email input field and enter the username
  // The locator finds the element with id="email"
  const emailInput = page.locator("#email");
  await emailInput.fill(params.username);

  // Step 3: Find the password input field and enter the password
  // The locator finds the element with id="password"
  const passwordInput = page.locator("#password");
  await passwordInput.fill(params.password);

  // Step 4: Click the submit button to log in
  // This will submit the login form with the credentials we just entered
  const submitButton = page.locator("#submit-button");
  await submitButton.click();

  // Step 5: Verify successful login by checking if the products grid is visible
  // If the products grid is not visible, waitFor will raise an exception
  const productsGrid = page.locator("#product-grid");
  await productsGrid.waitFor({ state: "visible", timeout: 10_000 });
}
