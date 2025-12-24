// https://docs.intunedhq.com/automation-sdks/intuned-sdk/typescript/helpers/functions/waitForNetworkSettled
import { BrowserContext, Page } from "playwright";
import { waitForNetworkSettled } from "@intuned/browser";

interface Params {
  // No params needed
}

// Decorator without arguments (uses timeoutInMs=30000, maxInflightRequests=0)
const clickLoadMore = waitForNetworkSettled(async (page: Page) => {
  await page.locator("main main button").click();
});

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  await page.goto("https://sandbox.intuned.dev/load-more");
  // Automatically waits for network to settle after clicking
  await clickLoadMore(page);
  // Network has settled, data is loaded
}

