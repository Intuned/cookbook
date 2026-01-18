import { z } from "zod";
import { Page, BrowserContext } from "playwright";
import { goToUrl } from "@intuned/browser";
import { RunError } from "@intuned/runtime";

import { createAuthSessionParams } from "../utils/typesAndSchemas";
import { getRecentOTP } from "../utils/resend";

type Params = z.infer<typeof createAuthSessionParams>;

export default async function create(
  params: Params,
  page: Page,
  context: BrowserContext
): Promise<void> {
  const validatedParams = createAuthSessionParams.safeParse(params);
  if (!validatedParams.success) {
    throw new RunError(validatedParams.error.message);
  }

  const { username, password } = validatedParams.data;
  // Step 1: Navigate to the login page
  await goToUrl({
    page,
    url: "https://sandbox.intuned.dev/signup",
  });

  // Step 2: Find the email input field and enter the username
  const emailInput = page.locator("#email-input");
  await emailInput.fill(username);

  // Step 3: Find the password input field and enter the password
  const passwordInput = page.locator("#password-input");
  await passwordInput.fill(password);

  // Step 4: Click on the Send OTP button
  const submitButton = page.locator("#submit-button");
  await submitButton.click();

  // Step 5: Generate the OTP code using the secret
  const otpInput = page.locator("#otp-input");
  const otpCode = await getRecentOTP();

  if (!otpCode) {
    throw new RunError("Failed to extract OTP");
  }

  // Step 6: Fill in the OTP code
  await otpInput.fill(otpCode);

  // Step 7: Click the submit button to complete OTP verification
  const otpSubmitButton = page.locator("#submit-button");
  await otpSubmitButton.click();

  // Step 8: Verify successful login by checking if the protected page is visible
  // If the protected page is not visible, waitFor will raise an exception
  const protectedPage = page.locator("#book-consultations-title");
  await protectedPage.waitFor({ state: "visible", timeout: 10_000 });
}
