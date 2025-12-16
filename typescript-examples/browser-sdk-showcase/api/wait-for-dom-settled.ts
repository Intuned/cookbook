import { BrowserContext, Page } from "playwright";
import { waitForDomSettled, goToUrl } from "@intuned/browser";

interface Params {
  settleDuration?: number;
  timeoutInMs?: number;
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  const settleDuration = params.settleDuration || 500;
  const timeoutInMs = params.timeoutInMs || 30000;

  await goToUrl({ page, url: "https://careers.qualcomm.com/careers" });


  await page.locator("xpath=//button[@class='btn btn-sm btn-secondary show-more-positions']").click();
  await waitForDomSettled({
    source: page,
    settleDurationMs: settleDuration,
    timeoutInMs,
  })

  // DOM has settled, new content is loaded
  return "Success";
}

