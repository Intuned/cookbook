import { BrowserContext, Page } from "playwright";
import { sanitizeHtml } from "@intuned/browser";

interface Params {
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
    await page.goto("https://books.toscrape.com");
    const firstRow = page.locator("ol.row").locator("li").first();
    const html = await firstRow.innerHTML();
    const sanitizedHtml = sanitizeHtml({ html });
    console.log(sanitizedHtml);
    return sanitizedHtml;
}

