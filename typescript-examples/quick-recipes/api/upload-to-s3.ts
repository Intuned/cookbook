import { BrowserContext, Page } from "playwright";
import { saveFileToS3 } from "@intuned/browser";

interface Params {
  // No params needed
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  // Navigate to the file list
  await page.goto("https://sandbox.intuned.dev/pdfs");

  // Locate the download trigger for the first row
  const downloadLocator = page.locator("xpath=//tbody/tr[1]//*[name()='svg']");

  // Download and upload to S3 in one step
  // https://docs.intunedhq.com/automation-sdks/intuned-sdk/typescript/helpers/functions/saveFileToS3
  const uploadedFile = await saveFileToS3({
    page,
    trigger: downloadLocator,
  });

  // Return signed URL for access
  const signedUrl = await uploadedFile.getSignedUrl();
  console.log(`Download uploaded file at: ${signedUrl}`);
  return signedUrl;
}
