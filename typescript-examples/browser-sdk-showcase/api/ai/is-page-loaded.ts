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
  await page.goto("https://books.toscrape.com/");
  
  const pageLoaded = await isPageLoaded({ page });
  
  if (pageLoaded) {
    // Continue with scraping or interactions
    console.log("Page is fully loaded");
  } else {
    // Wait longer or retry
    console.log("Page is still loading");
  }
  
  return "Done";
}

