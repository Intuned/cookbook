import { BrowserContext, Page } from "playwright";

interface Params {
  // Add your params here
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  return {};
}
