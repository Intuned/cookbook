import { withWaitForCaptchaSolve } from "@intuned/runtime";
import { Page } from "playwright";

/**
 * Navigate to URL with automatic captcha solving.
 *
 * Uses withWaitForCaptchaSolve as a wrapper - it wraps the navigation
 * and automatically waits for any captcha to resolve after the page loads.
 *
 * For manual control, use waitForCaptchaSolve as an awaitable instead:
 *   await page.goto(url);
 *   await waitForCaptchaSolve(page, { timeoutInMs: 30_000, settleDurationMs: 10_000 });
 *
 * @see https://docs.intunedhq.com/docs/05-references/runtime-sdk-typescript/captcha-helpers#withwaitforcaptchasolve
 */
export async function goToWithCaptchaSolve(
  page: Page,
  url: string
): Promise<void> {
  await withWaitForCaptchaSolve(async (page) => await page.goto(url), {
    page,
    timeoutInMs: 30_000,
    settleDurationMs: 15_000,
    waitForNetworkSettled: true,
  });
}
