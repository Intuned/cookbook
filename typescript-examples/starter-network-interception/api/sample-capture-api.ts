import { BrowserContext, Page, Response } from "playwright";
import { goToUrl, withNetworkSettledWait } from "@intuned/browser";

interface Params {
  url: string;
  apiPattern: string;
}

export default async function handler(
  params: Params,
  page: Page,
  _context: BrowserContext
) {
  const captured: unknown[] = [];

  const onResponse = async (response: Response) => {
    if (!response.url().includes(params.apiPattern)) return;
    try {
      captured.push(await response.json());
    } catch {
      // non-JSON response, skip
    }
  };

  page.on("response", onResponse);
  try {
    await withNetworkSettledWait(
      async () => {
        await goToUrl({ page, url: params.url });
      },
      { page, timeoutInMs: 20000 }
    );
  } finally {
    page.removeListener("response", onResponse);
  }

  return { matched: captured.length, responses: captured };
}
