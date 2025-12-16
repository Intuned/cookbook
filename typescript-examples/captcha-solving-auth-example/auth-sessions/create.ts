import { Page, BrowserContext } from "playwright";
import { goToUrl } from "@intuned/browser";

export interface CreateAuthSessionParams {
  email: string;
  password: string;
}

export default async function* create(
  params: CreateAuthSessionParams,
  page: Page,
  context: BrowserContext
): AsyncGenerator<unknown, any, string> {
  await goToUrl({
    page,
    url: "https://www.scrapingcourse.com/login/cf-turnstile",
  });

  await page.locator("#email").fill(params.email);
  await page.locator("#password").fill(params.password);

  await page.waitForTimeout(3000); // Wait until the captcha is solved

  await page.locator("#submit-button").click();
  await page.getByText("Logout").isVisible();

  return true;
}
