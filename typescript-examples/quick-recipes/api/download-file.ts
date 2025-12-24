import { BrowserContext, Page } from "playwright";
import { downloadFile } from "@intuned/browser";

interface Params {
  // No params needed
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  // Navigate to the sample downloads page
  await page.goto("https://sandbox.intuned.dev/pdfs");

  // Locate the download button for the first row
  const downloadLocator = page.locator("xpath=//tbody/tr[1]//*[name()='svg']");

  // Trigger download and wait for the file
  // https://docs.intunedhq.com/automation-sdks/intuned-sdk/typescript/helpers/functions/downloadFile
  const downloadedFile = await downloadFile({
    page,
    trigger: downloadLocator,
    timeoutInMs: 15000,
  });

  // Return the suggested filename for reference
  const fileName = downloadedFile.suggestedFilename();
  console.log(`Downloaded file: ${fileName}`);
  return fileName;
}
