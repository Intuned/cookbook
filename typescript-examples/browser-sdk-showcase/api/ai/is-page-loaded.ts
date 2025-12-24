// https://docs.intunedhq.com/automation-sdks/intuned-sdk/typescript/ai/functions/isPageLoaded
import { BrowserContext, Page } from "playwright";
import { isPageLoaded } from "@intuned/browser/ai";

interface Params {
  // No params needed
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  // Wait for page to finish loading
  await page.goto("https://sandbox.intuned.dev/");
  
  const pageLoaded = await isPageLoaded({ page });
  if (pageLoaded) {
    // Continue with scraping or interactions
    console.log("Page is loaded");
  } else {
    // Wait longer or retry
    await page.waitForTimeout(5000);
  }
}

