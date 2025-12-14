import { Page, BrowserContext } from "playwright";
import { goToUrl } from "@intuned/browser";
import { authenticator } from "otplib";

import { loginOTPSchema } from "../utils/typesAndSchemas";

export interface CreateAuthSessionParams {
  username: string;
  password: string;
  secret: string;
}

export default async function* create(
  params: CreateAuthSessionParams,
  page: Page,
  context: BrowserContext
): AsyncGenerator<unknown, any, string> {
  const validatedParams = loginOTPSchema.safeParse(params);

  if (!validatedParams.success) {
    throw new Error(validatedParams.error.message);
  }

  const { username, password, secret } = validatedParams.data;

  // Step 1: Navigate to the login page
  await goToUrl({
    page,
    url: "https://sandbox.intuned.dev/login-otp",
  });

  // Step 2: Find the email input field and enter the username
  // The locator finds the element with id="email-input"
  const emailInput = page.locator("#email-input");
  await emailInput.fill(username);

  // Step 3: Find the password input field and enter the password
  // The locator finds the element with id="password-input"
  const passwordInput = page.locator("#password-input");
  await passwordInput.fill(password);

  // Step 4: Click the submit button to submit username and password
  // This will submit the login form with the credentials we just entered
  const submitButton = page.locator("#submit-button");
  await submitButton.click();

  // Step 5: Wait for the OTP input field to be visible
  // This confirms we're on the OTP page
  const otpInput = page.locator("#otp-input");
  await otpInput.waitFor({ state: "visible", timeout: 10000 });

  // Step 7: Generate the OTP code using the secret
  const otpCode = await authenticator.generate(secret);

  // Step 8: Fill in the OTP code
  await otpInput.fill(otpCode);

  // Step 9: Click the submit button to complete OTP verification
  const otpSubmitButton = page.locator("#submit-button");
  await otpSubmitButton.click();

  // Step 10: Wait for the page to load after OTP verification
  // We wait for the network to be idle, indicating the page has finished loading
  await page.waitForLoadState("networkidle");

  // Step 11: Verify successful login by checking if the products grid is visible
  // If the products grid is visible, it means we successfully logged in with OTP
  const productsGrid = page.locator("#product-grid");
  const isLoggedIn = await productsGrid.isVisible();

  // Return true if login was successful, false otherwise
  return isLoggedIn;
}
