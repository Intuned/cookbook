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
  await page.goto("https://www.booking.com/");
  
  const pageLoaded = await isPageLoaded({ page }); // Use AI vision to determine if the page has finished loading.
  // At this point, the AI has determined if the page has finished loading based on a screenshot taken of the page.
  
  if (pageLoaded) {
    // Continue with scraping or interactions
    console.log("Page is fully loaded");
  } else {
    // Wait longer or retry
    console.log("Page is still loading");
  }
  
  return "Done";
}

