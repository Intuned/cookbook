import { BrowserContext, Page } from "playwright";
import { clickUntilExhausted, goToUrl } from "@intuned/browser";

interface Params {
  // No params needed
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  await goToUrl({ page, url: "https://careers.qualcomm.com/careers" });

  const buttonLocator = page.locator(
    "xpath=//button[@class='btn btn-sm btn-secondary show-more-positions']"
  );

  // Click on the button to load more content 5 times.
  // Check https://docs.intunedhq.com/automation-sdks/intuned-sdk/typescript/helpers/functions/clickUntilExhausted for more details.
  await clickUntilExhausted({
    page,
    buttonLocator,
    maxClicks: 5,
  });

  // Now all content is loaded and visible
  return "Success";
}

