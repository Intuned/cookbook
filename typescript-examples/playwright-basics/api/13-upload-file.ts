import { BrowserContext, Page } from "playwright";
import { downloadFile, uploadFileToS3 } from "@intuned/browser";

/**
 * Upload File
 *
 * Demonstrates uploading files to S3:
 * - Download a file first using Intuned SDK
 * - Upload to S3 using Intuned SDK (uses managed S3 by default)
 */

interface Params {}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  // Navigate to a page with downloadable files
  await page.goto("https://the-internet.herokuapp.com/download");
  await page.waitForLoadState("load");

  // Download a file using Intuned SDK
  const downloadedFile = await downloadFile({
    page,
    trigger: page.locator("a[href*='.txt']").first(),
  });

  console.log({
    path: await downloadedFile.path(),
    suggestedName: downloadedFile.suggestedFilename,
  });

  // Upload to S3 using Intuned SDK
  // When no S3Configs are provided, it uses Intuned's managed S3 bucket
  const uploadedFile = await uploadFileToS3({
    file: downloadedFile,
    fileNameOverride: "uploaded-file.txt",
    contentType: "text/plain",
  });

  return {
    message: "File uploaded successfully",
    downloadedFileName: downloadedFile.suggestedFilename,
    uploadedFilePath: uploadedFile.getFilePath(),
    signedUrl: await uploadedFile.getSignedUrl(),
  };
}
