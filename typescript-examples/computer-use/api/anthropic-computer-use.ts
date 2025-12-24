import z from "zod";
import { BrowserContext, Page } from "playwright";
import { getAiGatewayConfig } from "@intuned/runtime";
import { samplingLoop } from "../lib/anthropic/sampling-loop";

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

  // Get AI gateway config
  const { apiKey, baseUrl } = await getAiGatewayConfig();

  // Hardcoded configuration
  const model = 'claude-sonnet-4-5';
  const thinkingBudget = 1024;
  const maxTokens = 4096;

  // Set viewport size to match the computer tool's display dimensions
  await page.setViewportSize({
    width: 1280,
    height: 720,
  });

  try {
    // Run the sampling loop
    const finalMessages = await samplingLoop({
      model,
      messages: [{
        role: 'user',
        content: query,
      }],
      apiKey,
      baseURL: baseUrl,
      thinkingBudget,
      maxTokens,
      playwrightPage: page,
    });

    // Extract the final result from the messages
    if (finalMessages.length === 0) {
      throw new Error('No messages were generated during the sampling loop');
    }

    const lastMessage = finalMessages[finalMessages.length - 1];
    if (!lastMessage) {
      throw new Error('Failed to get the last message from the sampling loop');
    }

    const result = typeof lastMessage.content === 'string'
      ? lastMessage.content
      : lastMessage.content.map(block =>
        block.type === 'text' ? block.text : ''
      ).join('');

    return {
      result,
      messageCount: finalMessages.length,
    };
  } catch (error) {
    console.error('Error in sampling loop:', error);
    throw error;
  }
}
