import { BrowserContext, Page } from "playwright";
import { uploadFileToS3 } from "@intuned/browser";

interface Params {
  // Add your params here
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  // Navigate to the page to capture
  await page.goto("https://www.example.com");

  // Capture screenshot as bytes
  const screenshotInBytes = await page.screenshot();

  // Upload the screenshot to S3
  const uploadedFile = await uploadFileToS3({
    file: screenshotInBytes,
    fileNameOverride: "screenshot.png",
    contentType: "image/png",
  });

  // Provide a signed URL for retrieval
  const signedUrl = await uploadedFile.getSignedUrl();
  console.log(`Check the screenshot at: ${signedUrl}`);
  return uploadedFile;
}
