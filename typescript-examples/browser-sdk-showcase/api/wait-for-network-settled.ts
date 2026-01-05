// https://docs.intunedhq.com/automation-sdks/intuned-sdk/typescript/helpers/functions/withNetworkSettledWait
import { withNetworkSettledWait } from "@intuned/browser";
import { BrowserContext, Page } from "playwright";

interface Params {}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  await page.goto("https://sandbox.intuned.dev/infinite-scroll");

  // Execute action and wait for network to settle
  const result = await withNetworkSettledWait(
    async (page) => {
      // scroll to load more content
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      return "scrolled";
    },
    {
      page,
      timeoutInMs: 15000,
      maxInflightRequests: 0,
    }
  );
  console.log(result); // "scrolled"
  return result;
}