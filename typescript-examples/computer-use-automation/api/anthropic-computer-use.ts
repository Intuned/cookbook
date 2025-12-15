import z from "zod";
import { BrowserContext, Page } from "playwright";
import { samplingLoop } from "../lib/anthropic/sampling-loop";

interface Params {
  query: string;        // The task you want the AI to perform
  apiKey?: string;       // Your Anthropic API key
  model?: string;       // Model to use (default: 'claude-sonnet-4-20250514')
  thinkingBudget?: number;  // Token budget for thinking (default: 1024)
  maxTokens?: number;   // Max tokens per request (default: 4096)
}

export default async function handler(
  params: Params,
  page: Page,
  _: BrowserContext,
) {
  const {
    query,
    model = 'claude-sonnet-4-20250514',
    thinkingBudget = 1024,
    maxTokens = 4096,
  } = params;
  let { apiKey } = params;
  if (!apiKey) {
    apiKey = process.env.ANTHROPIC_API_KEY;
  }

  // Note: The Playwright page is already initialized and ready to use
  // Claude can use the go_to_url action to navigate directly without opening a browser

  if (!query) {
    throw new Error('Query is required');
  }

  if (!apiKey) {
    throw new Error('API key is required');
  }

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
