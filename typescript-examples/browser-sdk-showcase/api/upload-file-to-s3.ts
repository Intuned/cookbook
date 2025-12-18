import { BrowserContext, Page } from "playwright";
import { uploadFileToS3, downloadFile, S3Configs } from "@intuned/browser";

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

  // Download a file first
  const download = await downloadFile({
    page,
    trigger: "https://intuned-docs-public-images.s3.amazonaws.com/32UP83A_ENG_US.pdf",
  });

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

  const uploadedFile = await uploadFileToS3({
    file: download,
    configs: s3Config,
    fileNameOverride: "myfile.pdf",
    contentType: "application/pdf",
  });

  const signedUrl = await uploadedFile.getSignedUrl();
  console.log(signedUrl);
  
  return signedUrl;
}

