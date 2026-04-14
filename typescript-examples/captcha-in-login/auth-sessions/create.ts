import { Page, BrowserContext } from "playwright";
import { goToUrl } from "@intuned/browser";
import { waitForCaptchaSolve } from "@intuned/runtime";

export interface CreateAuthSessionParams {
  email: string;
  password: string;
}

export default async function create(
  params: CreateAuthSessionParams,
  page: Page,
  context: BrowserContext
): Promise<void> {
  await goToUrl({
    page,
    url: "https://www.scrapingcourse.com/login/cf-turnstile",
  });

  await page.locator("#email").fill(params.email);
  await page.locator("#password").fill(params.password);

  await waitForCaptchaSolve(page, {
    timeoutInMs: 30_000,
    settleDurationMs: 10_000,
  });

  await page.locator("#submit-button").click();
  // Verify successful login by checking if Logout button is visible
  // If the Logout button is not visible, waitFor will raise an exception
  await page.getByText("Logout").waitFor({ state: "visible", timeout: 10_000 });
}
