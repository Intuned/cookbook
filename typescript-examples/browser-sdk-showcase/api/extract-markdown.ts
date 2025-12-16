import { BrowserContext, Page } from "playwright";
import { extractMarkdown } from "@intuned/browser";

interface Params {
  // No params needed
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  await page.goto("https://books.toscrape.com");
  
  const headerLocator = page.locator("h1");
  const markdown = await extractMarkdown({ source: headerLocator }); // Extract markdown from the header locator.
  
  console.log(markdown);
  return markdown;
}

