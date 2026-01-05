import { BrowserContext, Page } from "playwright";

/**
 * Basic Navigation
 *
 * Demonstrates the simplest Playwright operation: navigating to a URL
 * and returning the page title.
 */

interface Params {
  url: string;
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  // Navigate to the URL
  await page.goto(params.url);

  // Get basic page info
  const title = await page.title();
  const url = page.url();

  return {
    title,
    url,
  };
}
