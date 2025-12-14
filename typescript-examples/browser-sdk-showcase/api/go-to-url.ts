import { BrowserContext, Page } from "playwright";
import { goToUrl } from "@intuned/browser";

interface Params {
  url?: string;
  waitUntil?: "load" | "domcontentloaded" | "networkidle"
  timeout?: number;
  waitForLoadingStateUsingAi?: boolean;
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  const url = params.url || "https://books.toscrape.com/";
  const waitUntil = params.waitUntil || "load";
  const timeout = params.timeout || 30000;
  const waitForLoadingStateUsingAi = params.waitForLoadingStateUsingAi || false; // You must provide an API Key in the environment variables for this to work. Or use Intuned's Gateway.
  // Navigate with custom options
  await goToUrl({
    page,
    url,
    waitForLoadState: waitUntil,
    timeoutInMs:timeout,
    waitForLoadingStateUsingAi,
  });

  // Now the page is loaded and ready to use.
  return `Successfully navigated to ${url}`;
}

