import { BrowserContext, Page } from "playwright";
import { goToUrl } from "@intuned/browser";

export default async function check(
  page: Page,
  context: BrowserContext
): Promise<boolean> {
  await goToUrl({
    page,
    url: "https://www.scrapingcourse.com/dashboard",
  });

  return await page.getByText("Logout").isVisible();
}
