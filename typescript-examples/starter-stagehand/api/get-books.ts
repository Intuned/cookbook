import { Stagehand, AISdkClient } from "@browserbasehq/stagehand";
import { createOpenAI } from "@ai-sdk/openai";
import type { Page, BrowserContext } from "playwright";
import { attemptStore, getAiGatewayConfig } from "@intuned/runtime";
import z from "zod";

interface Params {
  category?: string;
}

const booksSchema = z.object({
  books: z.array(
    z.object({
      title: z.string(),
      price: z.string(),
    })
  ),
});

async function getWebSocketUrl(cdpUrl: string): Promise<string> {
  if (cdpUrl.startsWith("ws://") || cdpUrl.startsWith("wss://")) return cdpUrl;
  const versionUrl = cdpUrl.replace(/\/?$/, "/json/version");
  const res = await fetch(versionUrl);
  const data = await res.json();
  return data.webSocketDebuggerUrl;
}

export default async function handler(
  { category }: Params,
  page: Page,
  _context: BrowserContext
) {
  const { baseUrl, apiKey } = await getAiGatewayConfig();
  const cdpUrl = attemptStore.get("cdpUrl") as string;
  const webSocketUrl = await getWebSocketUrl(cdpUrl);

  const openai = createOpenAI({ apiKey, baseURL: baseUrl });
  const llmClient = new AISdkClient({ model: openai("gpt-5-mini") });

  const stagehand = new Stagehand({
    env: "LOCAL",
    localBrowserLaunchOptions: {
      cdpUrl: webSocketUrl,
      viewport: { width: 1280, height: 800 },
    },
    llmClient,
  });
  await stagehand.init();

  try {
    await page.goto("https://books.toscrape.com");

    if (category) {
      await stagehand.act(`Click the "${category}" category link in the sidebar`);
    }

    const result = await stagehand.extract(
      "Extract all books visible on the page with their title and price",
      booksSchema
    );

    return result;
  } finally {
    await stagehand.close();
  }
}
