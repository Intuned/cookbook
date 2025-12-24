// https://docs.intunedhq.com/automation-sdks/intuned-sdk/typescript/helpers/functions/downloadFile
import { BrowserContext, Page } from "playwright";
import { downloadFile } from "@intuned/browser";

interface Params {
  timeout?: number;
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  const timeout = params.timeout || 15000;

  // Direct download from URL
  let download = await downloadFile({
    page,
    trigger: "https://intuned-docs-public-images.s3.amazonaws.com/32UP83A_ENG_US.pdf",
    timeoutInMs: timeout,
  });
  console.log("Result of downloading file from URL:");
  console.log(download.suggestedFilename());

  // Download from trigger
  await page.goto("https://sandbox.intuned.dev/pdfs");
  download = await downloadFile({
    page,
    trigger: page.locator("xpath=//tbody/tr[1]//*[name()='svg']"),
  });
  console.log("Result of downloading file from trigger:");
  console.log(download.suggestedFilename());

  // Download from trigger with custom callable function
  await page.goto("https://sandbox.intuned.dev/pdfs");
  download = await downloadFile({
    page,
    trigger: async (page: Page) => {
      await page.locator("xpath=//tbody/tr[1]//*[name()='svg']").click();
    },
  });
  console.log("Result of downloading file from trigger with custom callable function:");
  console.log(download.suggestedFilename());

  return download.suggestedFilename();
}

