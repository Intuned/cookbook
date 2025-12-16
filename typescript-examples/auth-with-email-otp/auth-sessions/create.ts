import { z } from "zod";
import { Page, BrowserContext } from "playwright";
import { goToUrl } from "@intuned/browser";
import { RunError } from "@intuned/runtime";

import { createAuthSessionParams } from "../utils/typesAndSchemas";
import { getRecentOTP } from "../utils/resend";

type Params = z.infer<typeof createAuthSessionParams>;

export default async function* create(
  params: Params,
  page: Page,
  context: BrowserContext
): AsyncGenerator<unknown, any, string> {
  const validatedParams = createAuthSessionParams.safeParse(params);
  if (!validatedParams.success) {
    throw new RunError(validatedParams.error.message);
  }

  const { username } = validatedParams.data;
  // Step 1: Navigate to the login page
  await goToUrl({
    page,
    url: "https://sandbox.intuned.dev/login-email-otp",
  });

  // Step 2: Find the email input field and enter the username
  const emailInput = page.locator("#email-input");
  await emailInput.fill(username);

  // Step 2: Click on the Send OTP button
  const submitButton = page.locator("#submit-button");
  await submitButton.click();

  // Step 3: Generate the OTP code using the secret
  const otpInput = page.locator("#otp-input");
  const otpCode = await getRecentOTP();

  if (!otpCode) {
    throw new RunError("Failed to extract OTP");
  }

  // Step 4: Fill in the OTP code
  await otpInput.fill(otpCode);

  // Step 5: Click the submit button to complete OTP verification
  const otpSubmitButton = page.locator("#submit-button");
  await otpSubmitButton.click();

  // Step 8: Verify successful login by checking if the protected page is visible
  // If the protected page is visible, it means we successfully logged in
  const protectedPage = page.locator("#book-consultations-title");
  let isLoggedIn = true;
  try {
    await protectedPage.waitFor({ state: "visible" });
  } catch (error) {
    isLoggedIn = false;
  }

  // Return true if login was successful, false otherwise
  return isLoggedIn;
}
