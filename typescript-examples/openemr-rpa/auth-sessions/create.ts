import { Page, BrowserContext } from "playwright";
import { goToUrl } from "@intuned/browser";
import * as OTPAuth from "otpauth";

const LOGIN_URL = "https://openemr-intuned.fly.dev";
const MAIN_URL_PATTERN = "**/interface/main/tabs/main.php*";

export interface CreateAuthSessionParams {
  username: string;
  password: string;
  // TOTP secret (base32) — only required if the account has 2FA enabled
  otpSecret?: string;
}

export default async function create(
  params: CreateAuthSessionParams,
  page: Page,
  context: BrowserContext
): Promise<void> {
  // Step 1: Navigate to the OpenEMR login page
  await goToUrl({ page, url: LOGIN_URL });

  // Step 2: Fill in the credentials
  await page.locator("#authUser").fill(params.username);
  await page.locator("#clearPass").fill(params.password);

  // OpenEMR's MFA challenge renders a TOTP form instead of the main screen
  const totpInput = page.locator('input[name="totp"], #totp').first();
  const loginLandedOrTotpShown = async (timeout: number) => {
    await Promise.race([
      page.waitForURL(MAIN_URL_PATTERN, { timeout }).catch(() => {}),
      totpInput.waitFor({ state: "visible", timeout }).catch(() => {}),
    ]);
  };

  // Step 3: Submit the login form. The login button (#login-button) relies on
  // the page's own JS (onclick="transmit_form(this)"), which is sometimes
  // inert; if clicking does not navigate, submit the form directly.
  await page.locator("#login-button").click();
  await page.waitForTimeout(1500);
  await loginLandedOrTotpShown(10_000);
  if (!page.url().includes("/interface/main/") && !(await totpInput.isVisible().catch(() => false))) {
    await page.locator("#clearPass").evaluate((el) => (el as HTMLInputElement).form?.submit());
    // A successful login lands on interface/main/tabs/main.php?token_main=...
    // With wrong credentials the site reloads login.php and this times out.
    await loginLandedOrTotpShown(30_000);
  }

  // Step 4: Handle the 2FA (TOTP) challenge if the account requires it.
  // The code is generated fresh here because TOTP codes expire in ~30s.
  if (await totpInput.isVisible().catch(() => false)) {
    if (!params.otpSecret) {
      throw new Error(
        "This account requires 2FA (TOTP) but no otpSecret was provided. " +
          "Add the base32 TOTP secret as `otpSecret` in the auth-session create parameters."
      );
    }
    const totp = new OTPAuth.TOTP({ secret: params.otpSecret });
    await totpInput.fill(totp.generate());
    await page.waitForTimeout(1500);
    await totpInput.evaluate((el) => (el as HTMLInputElement).form?.submit());
  }

  // With wrong credentials or an invalid TOTP code the site reloads the
  // login/MFA page and this times out.
  await page.waitForURL(MAIN_URL_PATTERN, { timeout: 30_000 });

  // Step 5: Verify login succeeded — the top navigation menu only renders
  // for an authenticated user.
  await page.locator("#mainMenu, nav.navbar").first().waitFor({ state: "visible", timeout: 30_000 });
}
