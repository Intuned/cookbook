import z from "zod";
import type { Page, Stagehand } from "@browserbasehq/stagehand";
import { attemptStore } from "@intuned/runtime";

interface Params {
  query: string;  // The task you want the AI to perform
}

type BrowserContext = Stagehand['context'];
export default async function handler(
  params: Params,
  page: Page,
  _: BrowserContext,
) {
  const { query } = params;

  if (!query) {
    throw new Error('Query is required');
  }

  const stagehand: Stagehand = attemptStore.get("stagehand");

  // Set viewport size to match the computer tool's display dimensions
  await page.setViewportSize(1280, 720);


  const model = 'anthropic/claude-sonnet-4-5';

  const agent = stagehand.agent({
    model: model,
    systemPrompt: "You are a helpful assistant that can use a web browser to complete tasks.",
  });

  // Agent runs on current Stagehand page
  const result = await agent.execute({
    instruction: query,
    maxSteps: 20,
  });

  return {
    result: result.success ? 'Task completed successfully' : 'Task failed',
    success: result.success,
  };
}
