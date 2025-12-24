// https://docs.intunedhq.com/automation-sdks/intuned-sdk/typescript/helpers/functions/scrollToLoadContent
import { BrowserContext, Page } from "playwright";
import { scrollToLoadContent, goToUrl } from "@intuned/browser";
import { extendTimeout } from "@intuned/runtime";

interface Params {
  extendTimeoutOnScroll?: boolean;
  maxScrolls?: number;
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  const extendTimeoutOnScroll = params.extendTimeoutOnScroll ?? false;
  const maxScrolls = params.maxScrolls ?? 10;

  await goToUrl({ page, url: "https://sandbox.intuned.dev/infinite-scroll" });

  // Scroll through entire page content
  // This will handle infinite scrolls by scrolling the page continuously, and when max_scrolls is reached, it will stop and the data items will be loaded.
  // Read about extend_timeout: https://docs.intunedhq.com/docs/05-references/runtime-sdk-python/extend-timeout
  await scrollToLoadContent({
    source: page,
    onScrollProgress: extendTimeoutOnScroll ? extendTimeout : () => {},
    maxScrolls,
  });

  // Will keep scrolling until the page has loaded all content or the max_scrolls is reached.
  return "Success";
}

