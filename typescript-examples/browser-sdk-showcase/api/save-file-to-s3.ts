import { BrowserContext, Page } from "playwright";
import { saveFileToS3, goToUrl, S3Configs } from "@intuned/browser";

interface Params {
  bucket?: string;
  region?: string;
  accessKey?: string;
  secretKey?: string;
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  const bucket = params.bucket;
  const region = params.region;
  const accessKey = params.accessKey;
  const secretKey = params.secretKey;

  await goToUrl({ page, url: "https://sandbox.intuned.dev/pdfs" });

  // Configure S3 configuration
  // Priority: params → environment variables → Intuned's managed S3 bucket (default)
  let s3Config: S3Configs | undefined = undefined;
  if (bucket && region && accessKey && secretKey) {
    s3Config = {
      bucket: bucket,
      region,
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    };
  }

  // Download using a locator
  const uploadedFile = await saveFileToS3({
    page,
    trigger: page.locator("xpath=//tbody/tr[1]//*[name()='svg']"),
    timeoutInMs: 10000,
    configs: s3Config,
  });

  console.log(`File uploaded to: ${uploadedFile.key}`);
  return uploadedFile.key;
}

