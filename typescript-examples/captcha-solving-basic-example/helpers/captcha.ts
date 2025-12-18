import { withWaitForCaptchaSolve } from "@intuned/runtime";
import { Page } from "playwright";

export async function goToWithCaptchaSolve(
  page: Page,
  url: string
): Promise<void> {
  await withWaitForCaptchaSolve(async (page) => await page.goto(url), {
    page,
    timeoutInMs: 30_000,
    settleDurationMs: 10_000,
    waitForNetworkSettled: true,
  });
}
