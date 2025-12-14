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

  // Click until exhausted
  await clickUntilExhausted({
    page,
    buttonLocator,
    maxClicks: 5,
  });

  // Now all content is loaded and visible
  return "Success";
}

