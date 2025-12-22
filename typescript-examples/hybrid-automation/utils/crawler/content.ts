import { Page } from "playwright";
import { extractMarkdown } from "@intuned/browser";
import { extractStructuredData } from "@intuned/browser/ai";

export async function extractPageContent(
  page: Page,
  schema?: any
): Promise<any> {
  if (schema) {
    return await extractStructuredData({
      source: page,
      dataSchema: schema,
    });
  }

  const title = await page.title();
  const markdown = await extractMarkdown({ source: page });

  return {
    title,
    markdown,
    markdown_length: markdown?.length || 0,
  };
}
