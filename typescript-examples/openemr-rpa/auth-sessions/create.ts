import { Page, BrowserContext } from "playwright";
import { goToUrl } from "@intuned/browser";

const LOGIN_URL =
  "https://demo.openemr.io/openemr/interface/login/login.php?site=default";

export interface CreateAuthSessionParams {
  username: string;
  password: string;
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

  // Step 3: Submit the login form. The login button (#login-button) relies on
  // the page's own JS (onclick="transmit_form(this)"), which is sometimes
  // inert; if clicking does not navigate, submit the form directly.
  await page.locator("#login-button").click();
  try {
    await page.waitForURL("**/interface/main/tabs/main.php*", {
      timeout: 10_000,
    });
  } catch {
    await page
      .locator("#clearPass")
      .evaluate((el) => (el as HTMLInputElement).form?.submit());
    // A successful login lands on interface/main/tabs/main.php?token_main=...
    // With wrong credentials the site reloads login.php and this times out.
    await page.waitForURL("**/interface/main/tabs/main.php*", {
      timeout: 30_000,
    });
  }

  // Step 4: Verify login succeeded — the top navigation menu only renders
  // for an authenticated user.
  await page
    .locator("#mainMenu, nav.navbar")
    .first()
    .waitFor({ state: "visible", timeout: 30_000 });
}
