import { Stagehand, AISdkClient } from "@browserbasehq/stagehand";
import { createOpenAI } from "@ai-sdk/openai";
import type { Page, BrowserContext } from "playwright";
import { attemptStore, getAiGatewayConfig } from "@intuned/runtime";

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

  // Get AI gateway config for Stagehand
  const { baseUrl, apiKey } = await getAiGatewayConfig();
  const cdpUrl = attemptStore.get("cdpUrl") as string;
  const webSocketUrl = await getWebSocketUrl(cdpUrl);

  // Create AI SDK provider with Intuned's AI gateway
  const openai = createOpenAI({
    apiKey,
    baseURL: baseUrl,
  });

  const llmClient = new AISdkClient({
    model: openai("computer-use-preview"),
  });

  // Initialize Stagehand (non-CUA mode)
  const stagehand = new Stagehand({
    env: "LOCAL",
    localBrowserLaunchOptions: {
      cdpUrl: webSocketUrl,
      viewport: { width: 1280, height: 800 },
      downloadsPath: "./tmp",
    },
    llmClient,
    logger: console.log,
  });

  await stagehand.init();
  console.log("\nInitialized 🤘 Stagehand (non-CUA mode)");

  try {
    const agent = stagehand.agent({
      cua: false, // Non-CUA agent using DOM-based automation
      systemPrompt: "You are a helpful assistant that can use a web browser to complete tasks.",
    });

    // Agent runs on current page
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
