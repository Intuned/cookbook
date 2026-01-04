// https://docs.intunedhq.com/automation-sdks/intuned-sdk/typescript/helpers/functions/waitForDomSettled
import { BrowserContext, Page } from "playwright";
import { waitForDomSettled } from "@intuned/browser";

interface Params {
  // No params needed
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  await page.goto("https://sandbox.intuned.dev/load-more");
  // Automatically waits for DOM to settle after clicking
  await page.locator("main main button").click();
  await waitForDomSettled({
    source: page,
    settleDurationMs: 500,
    timeoutInMs: 30000,
  });
  // DOM has settled, new content is loaded
}

