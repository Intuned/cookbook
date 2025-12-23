import { BrowserContext, Page } from "playwright";
import { downloadFile } from "@intuned/browser";

/**
 * Download File
 *
 * Demonstrates downloading files using:
 * - Playwright's native download handling
 * - Intuned SDK's downloadFile helper
 */

interface Params {}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  await page.goto("https://www.princexml.com/samples/");
  await page.waitForLoadState("networkidle");

  // Method 1: Using Intuned SDK helper (recommended)
  // The downloadFile helper handles the download event automatically
  const downloadedFile = await downloadFile({
    page,
    trigger: page.locator("#dictionary > p.links > a:nth-child(2)"),
  });

  const filePath = await downloadedFile.path();
  const suggestedName = downloadedFile.suggestedFilename;

  // Method 2: Native Playwright download handling
  // This shows the manual approach for reference
  //
  // const [download] = await Promise.all([
  //   page.waitForEvent("download"),
  //   page.locator("#dictionary > p.links > a:nth-child(2)").click(),
  // ]);
  // const nativePath = await download.path();
  // const nativeName = download.suggestedFilename();

  return {
    success: true,
    filePath,
    suggestedFilename: suggestedName,
  };
}
