import { BrowserContext, Page } from "playwright-core";
import { saveFileToS3 } from "@intuned/browser";

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

  // Download and upload to S3 in one step
  const uploadedFile = await saveFileToS3({
    page,
    trigger: downloadLocator,
    timeoutInMs: 15000,
  });

  // Get signed URL for access
  const signedUrl = await uploadedFile.getSignedUrl();
  console.log(`Download uploaded file at: ${signedUrl}`);
  return uploadedFile;
}

