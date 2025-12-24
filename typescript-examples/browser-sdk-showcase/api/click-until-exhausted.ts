// https://docs.intunedhq.com/automation-sdks/intuned-sdk/typescript/helpers/functions/clickUntilExhausted
import { BrowserContext, Page } from "playwright";
import { clickUntilExhausted } from "@intuned/browser";

interface Params {
  // No params needed
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  await page.goto("https://sandbox.intuned.dev/load-more");

  const loadMoreButton = page.locator("main main button");  // Select the main button in the main content area.

  // Click until button disappears or is disabled
  await clickUntilExhausted({
    page,
    buttonLocator: loadMoreButton,
    maxClicks: 20,
  });

  // Will keep clicking the button until the button disappears or is disabled or the max_clicks is reached.
  return "Success";
}

