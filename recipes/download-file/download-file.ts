import { BrowserContext, Page } from "playwright-core";
import { downloadFile } from "@intuned/browser";

interface Params {
  // Add your params here
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  await page.goto("https://sandbox.intuned.dev/pdfs");

  // Locate the download button
  const downloadLocator = page.locator("xpath=//tbody/tr[1]//*[name()='svg']");

  // Trigger download and wait for file
  const downloadedFile = await downloadFile({
    page,
    trigger: downloadLocator,
    timeoutInMs: 15000,
  });

  const fileName = downloadedFile.suggestedFilename();
  return fileName;
}

