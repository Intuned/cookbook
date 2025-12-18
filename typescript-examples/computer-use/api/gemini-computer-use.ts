import z from "zod";
import type { Stagehand } from "@browserbasehq/stagehand";
import type { Page, BrowserContext } from "playwright";
import { attemptStore } from "@intuned/runtime";

interface Params {
  query: string;  // The task you want the AI to perform
}

export default async function handler(
  params: Params,
  page: Page,
  _: BrowserContext,
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

  const stagehand: Stagehand = attemptStore.get("stagehand");

  const agent = stagehand.agent({
    cua: true, // CUA agent.
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
}
