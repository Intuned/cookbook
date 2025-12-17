import { BrowserContext, Page } from "playwright";
import { withNetworkSettledWait, goToUrl } from "@intuned/browser";

interface Params {
  timeout?: number;
  maxInflightRequests?: number;
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  const timeout = params.timeout || 30000;
  const maxInflightRequests = params.maxInflightRequests || 0;

  await goToUrl({ page, url: "https://careers.qualcomm.com/careers" });

  await withNetworkSettledWait(async (page: Page) => {
    await page
      .locator("xpath=//button[@class='btn btn-sm btn-secondary show-more-positions']")
      .click();
  },
  {
    page,
    timeoutInMs: timeout,
    maxInflightRequests,
  });

  // Automatically waits for network to settle after clicking

  // Network has settled, data is loaded
  return "Success";
}

