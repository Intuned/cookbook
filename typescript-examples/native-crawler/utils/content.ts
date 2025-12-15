import { Page } from "playwright";
import { extractMarkdown } from "@intuned/browser";

export async function extractPageContent(page: Page) {
  const title = await page.title();
  const markdown = await extractMarkdown(page);

  return {
    title,
    markdown,
    markdown_length: markdown?.length || 0,
  };
}
