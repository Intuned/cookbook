import { BrowserContext, Page } from "playwright";
import { scrollToLoadContent, goToUrl } from "@intuned/browser";
import { extendTimeout } from "@intuned/runtime";

interface Params {
  maxScrolls?: number;
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  const maxScrolls = params.maxScrolls || 5;

  await goToUrl({ page, url: "https://www.ycombinator.com/companies" });

  // Scroll to load all dynamic content
  await scrollToLoadContent({
    source: page,
    maxScrolls,
  });

  return "Content loaded successfully";
}

