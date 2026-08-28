import { Page, BrowserContext } from "playwright";
import { goToUrl } from "@intuned/browser";
import * as OTPAuth from "otpauth";

const BASE_URL = process.env.OPENEMR_BASE_URL ?? "https://demo.openemr.io/openemr";
const LOGIN_URL = `${BASE_URL}/interface/login/login.php?site=default`;

export interface CreateAuthSessionParams {
  username: string;
  password: string;
  otpSecret?: string;
}

export default async function create(
  params: CreateAuthSessionParams,
  page: Page,
  context: BrowserContext
): Promise<void> {
  await goToUrl({ page, url: LOGIN_URL });
  await page.locator("#authUser").fill(params.username);
  await page.locator("#clearPass").fill(params.password);
  const gate = page.locator("#totp, #mainMenu, nav.navbar").first();
  await page.locator("#login-button").click();
  try {
    await gate.waitFor({ state: "visible", timeout: 10_000 });
  } catch {
    await page
      .locator("#clearPass")
      .evaluate((el) => (el as HTMLInputElement).form?.submit());
    await gate.waitFor({ state: "visible", timeout: 30_000 });
  }
  if (await page.locator("#totp").isVisible()) {
    if (!params.otpSecret) {
      throw new Error(
        "Login requires a TOTP code but no otpSecret was provided in the credentials."
      );
    }
    const totp = new OTPAuth.TOTP({ secret: params.otpSecret });
    await page.locator("#totp").fill(totp.generate());
    await page
      .locator("#totp")
      .evaluate((el) => (el as HTMLInputElement).form?.submit());
  }
  await page
    .locator("#mainMenu, nav.navbar")
    .first()
    .waitFor({ state: "visible", timeout: 30_000 });
}
