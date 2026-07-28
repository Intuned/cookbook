import { BrowserContext, Page } from "playwright";
import { goToUrl } from "@intuned/browser";

// Lightweight protected page. When the session is invalid, OpenEMR either
// redirects to interface/login/login.php or rejects the request outright
// (HTTP 400), so we never land here with the Message Center UI rendered.
// Note: interface/main/tabs/main.php cannot be used — it requires a one-time
// token_main query parameter and returns 400 without it even when logged in.
const PROTECTED_URL =
  "https://demo.openemr.io/openemr/interface/main/messages/messages.php?form_active=1";

export default async function check(
  page: Page,
  context: BrowserContext,
): Promise<boolean> {
  await goToUrl({ page, url: PROTECTED_URL });

  // Redirected away from the protected page -> session is invalid.
  if (!page.url().includes("/interface/main/messages/messages.php")) {
    return false;
  }

  // Session is valid only if the authenticated Message Center UI renders
  // (it has a top navbar; the login page and error pages do not).
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
