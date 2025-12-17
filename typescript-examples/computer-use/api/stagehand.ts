import z from "zod";
import type { Stagehand } from "@browserbasehq/stagehand";
import type { Page, BrowserContext } from "playwright";
import { attemptStore } from "@intuned/runtime";

interface Params {
  query: string;  // The task you want the AI to perform
}
export default async function handler(
  params: Params,
  page: Page,  // Playwright page
  _: BrowserContext,
) {
  const { query } = params;

  if (!query) {
    throw new Error('Query is required');
  }

  const stagehand: Stagehand = attemptStore.get("stagehand");
  const model = 'anthropic/claude-sonnet-4-5';

  const agent = stagehand.agent({
    cua: false, // Non-CUA agent.
    model: model,
    systemPrompt: "You are a helpful assistant that can use a web browser to complete tasks.",
  });

  // Agent runs on current Stagehand page
  const result = await agent.execute({
    instruction: query,
    maxSteps: 50,
    page: page,
  });
  return {
    result: result.success ? 'Task completed successfully' : 'Task failed',
    success: result.success,
  };
}
