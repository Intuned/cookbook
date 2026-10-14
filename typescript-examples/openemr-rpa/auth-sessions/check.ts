import { BrowserContext, Page } from "playwright";
import { goToUrl } from "@intuned/browser";
const PROTECTED_URL = "https://openemr-intuned.fly.dev/interface/main/calendar/find_appt_popup.php";

export default async function check(page: Page, context: BrowserContext): Promise<boolean> {
  await goToUrl({ page, url: PROTECTED_URL });

  try {
    await page.getByText("Start date").waitFor({ state: "visible", timeout: 15_000 });
    return true;
  } catch {
    return false;
  }
}
