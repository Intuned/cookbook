// https://docs.intunedhq.com/automation-sdks/intuned-sdk/typescript/helpers/functions/sanitizeHtml
import { BrowserContext, Page } from "playwright";
import { sanitizeHtml } from "@intuned/browser";

interface Params {
  removeStyles?: boolean;
  maxAttributeLength?: number;
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  await page.goto("https://books.toscrape.com");
  const removeStyles = params.removeStyles ?? true;
  const maxAttributeLength = params.maxAttributeLength ?? 100;
  const firstRow = page.locator("ol.row").locator("li").first();
  const html = await firstRow.innerHTML();
  const sanitizedHtml = sanitizeHtml({ html, removeStyles, maxAttributeLength });
  console.log("Sanitized HTML:");
  console.log(sanitizedHtml);
  return {
    sanitized_html: sanitizedHtml,
  };
}

