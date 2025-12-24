// https://docs.intunedhq.com/automation-sdks/intuned-sdk/typescript/helpers/functions/uploadFileToS3
import { BrowserContext, Page } from "playwright";
import { uploadFileToS3, downloadFile } from "@intuned/browser";

interface Params {
  // No params needed
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  // Download a file first
  const download = await downloadFile({
    page,
    trigger: "https://intuned-docs-public-images.s3.amazonaws.com/32UP83A_ENG_US.pdf",
  });

  const uploadedFile = await uploadFileToS3({
    file: download,
    fileNameOverride: "myfile.pdf",
    contentType: "application/pdf",
  });

  const signedUrl = await uploadedFile.getSignedUrl();
  console.log("Signed URL:");
  console.log(signedUrl);

  return signedUrl;
}

