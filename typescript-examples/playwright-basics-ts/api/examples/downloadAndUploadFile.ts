import { BrowserContext, Page } from "playwright";
import { downloadFile, uploadFileToS3, S3Configs } from "@intuned/browser";

interface Params {
  // Add your params if needed
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  await page.goto("https://www.princexml.com/samples/");
  await page.waitForLoadState("networkidle");

  // Download file
  const downloadedXmlFile = await downloadFile({
    page,
    trigger: page.locator("#dictionary > p.links > a:nth-child(2)"),
  });

  console.log({
    path: await downloadedXmlFile.path(),
    suggestedName: downloadedXmlFile.suggestedFilename,
  });

  // Upload to S3
  const s3Config: S3Configs = {
    bucket: "my-documents",
    region: "us-west-1",
    accessKeyId: "accessKeyId",
    secretAccessKey: "SecretAccessKeyId",
  };

  const file = await uploadFileToS3({ file: downloadedXmlFile, configs: s3Config });

  return {
    signedUrl: await file.getSignedUrl(),
    filePath: file.getFilePath(),
  };
}
