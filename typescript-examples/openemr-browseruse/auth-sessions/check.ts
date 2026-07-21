import { BrowserContext, Page } from "playwright";
import { goToUrl } from "@intuned/browser";
const BASE_URL = process.env.OPENEMR_BASE_URL ?? "https://demo.openemr.io/openemr";
const PROTECTED_URL = `${BASE_URL}/interface/main/messages/messages.php?form_active=1`;

export default async function check(
  page: Page,
  context: BrowserContext,
): Promise<boolean> {
  await goToUrl({ page, url: PROTECTED_URL });
  if (!page.url().includes("/interface/main/messages/messages.php")) {
    return false;
  }
  try {
    await page
      .locator("nav.navbar")
      .first()
      .waitFor({ state: "visible", timeout: 15_000 });
    return true;
  } catch {
    return false;
  }
}
