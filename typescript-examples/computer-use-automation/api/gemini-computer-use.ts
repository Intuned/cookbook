import z from "zod";
import type { Page, Stagehand } from "@browserbasehq/stagehand";
import { attemptStore } from "@intuned/runtime";

interface Params {
  query: string;         // The task you want the AI to perform
  apiKey?: string;       // Your Google Generative AI API key
  model?: string;        // Model to use (default: 'google/gemini-2.5-computer-use-preview-10-2025')
}

type BrowserContext = Stagehand['context'];
export default async function handler(
  params: Params,
  page: Page,
  _: BrowserContext,
) {
  const {
    query,
    model = 'google/gemini-2.5-computer-use-preview-10-2025',
  } = params;
  let { apiKey } = params;
  if (!apiKey) {
    apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  }

  if (!query) {
    throw new Error('query is required');
  }

  if (!apiKey) {
    throw new Error('API key is required (provide via params or GOOGLE_GENERATIVE_AI_API_KEY env var)');
  }

  const stagehand: Stagehand = attemptStore.get("stagehand");

  // Set viewport size to match the computer tool's display dimensions
  await page.setViewportSize(1280, 720);

  const agent = stagehand.agent({
    cua: true,
    model: {
        modelName: model,
        apiKey: apiKey
    },
    systemPrompt: "You are a helpful assistant that can use a web browser.",
  });

  // Agent runs on current Stagehand page
  const result = await agent.execute({
    instruction: query,
  });

  return {
    result: result.success ? 'Task completed successfully' : 'Task failed',
    success: result.success,
  };
}
