// https://docs.intunedhq.com/automation-sdks/intuned-sdk/typescript/helpers/functions/saveFileToS3
import { BrowserContext, Page } from "playwright";
import { saveFileToS3, goToUrl } from "@intuned/browser";

interface Params {
  // No params needed
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  await goToUrl({ page, url: "https://sandbox.intuned.dev/pdfs" });

  // Download using a locator
  const uploadedFile = await saveFileToS3({
    page,
    trigger: page.locator("xpath=//tbody/tr[1]//*[name()='svg']"),
  });

  const signedUrl = await uploadedFile.getSignedUrl();
  console.log(`Signed URL: ${signedUrl}`);
  return signedUrl;
}

