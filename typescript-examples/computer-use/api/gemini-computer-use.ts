import z from "zod";
import { Stagehand } from "@browserbasehq/stagehand";
import type { Page, BrowserContext } from "playwright";
import { attemptStore } from "@intuned/runtime";

interface Params {
  query: string;  // The task you want the AI to perform
}

async function getWebSocketUrl(cdpUrl: string): Promise<string> {
  const versionUrl = cdpUrl.endsWith("/")
    ? `${cdpUrl}json/version`
    : `${cdpUrl}/json/version`;
  const response = await fetch(versionUrl);
  const data = await response.json();
  return data.webSocketDebuggerUrl;
}

export default async function handler(
  params: Params,
  page: Page,
  _context: BrowserContext,
) {
  const { query } = params;

  if (!query) {
    throw new Error('Query is required');
  }

  // Get API key from environment
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }

  const model = 'google/gemini-2.5-computer-use-preview-10-2025';

  // Get CDP URL and convert to WebSocket URL
  const cdpUrl = attemptStore.get("cdpUrl") as string;
  const webSocketUrl = await getWebSocketUrl(cdpUrl);

  // Initialize Stagehand with Gemini CUA
  const stagehand = new Stagehand({
    env: "LOCAL",
    localBrowserLaunchOptions: {
      cdpUrl: webSocketUrl,
      viewport: { width: 1280, height: 800 },
      downloadsPath: "./tmp",
    },
    logger: console.log,
  });

  await stagehand.init();
  console.log("\nInitialized 🤘 Stagehand with Gemini CUA");

  try {
    const agent = stagehand.agent({
      cua: true, // Enable Computer Use API
      model: {
        modelName: model,
      },
      systemPrompt: "You are a helpful assistant that can use a web browser.",
    });

    const result = await agent.execute({
      instruction: query,
      maxSteps: 50,
    });

    return {
      result: result.success ? 'Task completed successfully' : 'Task failed',
      success: result.success,
    };
  } finally {
    // Cleanup Stagehand
    console.log("\nClosing 🤘 Stagehand...");
    await stagehand.close();
  }
}
