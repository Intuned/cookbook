// https://docs.intunedhq.com/automation-sdks/intuned-sdk/typescript/helpers/functions/goToUrl
import { BrowserContext, Page } from "playwright";
import { goToUrl } from "@intuned/browser";

interface Params {
  timeout?: number;
  retries?: number;
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  const timeout = params.timeout || 15000;
  const retries = params.retries || 3;

  // Navigate to the URL with enhanced reliability and automatic retries.
  // This will wait for the networkidle state more reliably than the default playwright behavior.
  // When waitForLoadingStateUsingAi=true, the function uses isPageLoaded under the hood to determine
  await goToUrl({
    page,
    url: "https://books.toscrape.com",
    timeoutInMs: timeout,
    retries,
    waitForLoadingStateUsingAi: true,
    // Since we are not passing the apiKey, the function will use the Intuned AI Gateway.
  });

  // Start your automation here, the page is already loaded and ready to use.
  return "Success";
}

