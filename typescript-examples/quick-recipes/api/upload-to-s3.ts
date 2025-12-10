import { BrowserContext, Page } from "playwright";
import { saveFileToS3 } from "@intuned/browser";

interface Params {
  // Add your params here
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
  const uploadedFile = await saveFileToS3({
    page,
    trigger: downloadLocator,
    timeoutInMs: 15000,
  });

  // Return signed URL for access
  const signedUrl = await uploadedFile.getSignedUrl();
  console.log(`Download uploaded file at: ${signedUrl}`);
  return uploadedFile;
}
