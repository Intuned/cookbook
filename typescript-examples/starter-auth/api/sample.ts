import { BrowserContext, Page } from "playwright";
import { goToUrl } from "@intuned/browser";


interface Params {
}



export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  const sandboxedUrl = "https://sandbox.intuned.dev/consultations-auth/book";

  await goToUrl({
    page: page,
    url: sandboxedUrl,
  });
  

  return {
  };
}
