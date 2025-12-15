import { BrowserContext, Page } from "playwright";
import { Agent } from "../lib/openai/agent";
import { PlaywrightComputer } from "../lib/openai/computer";
import type { ResponseOutputMessage, ResponseItem } from 'openai/resources/responses/responses';

interface Params {
  query: string;         // The query you want the AI to perform
  apiKey?: string;      // Your OpenAI API key
  model?: string;       // Model to use (default: 'computer-use-preview')
}

export default async function handler(
  params: Params,
  page: Page,
  _: BrowserContext,
) {

  const {
    query,
    model = 'computer-use-preview',
  } = params;
  let { apiKey } = params;
  if (!apiKey) {
    apiKey = process.env.OPENAI_API_KEY;
  }

  if (!query) {
    throw new Error('query is required');
  }

  if (!apiKey) {
    throw new Error('API key is required (provide via params or OPENAI_API_KEY env var)');
  }

  // Set viewport size to match the computer tool's display dimensions
  await page.setViewportSize({
    width: 1280,
    height: 720,
  });

  const start = Date.now();

  try {
    // Create the computer instance with the Playwright page
    const computer = new PlaywrightComputer(page);
    
    // Create the agent
    const agent = new Agent({
      model,
      computer,
      tools: [],
      apiKey,
      acknowledge_safety_check_callback: (m: string): boolean => {
        console.log(`> safety check: ${m}`);
        return true;
      },
    });

    // Run agent and get response
    const logs = await agent.runFullTurn({
      messages: [
        {
          role: 'system',
          content: `<SYSTEM_CAPABILITY>
- Current date and time: ${new Date().toISOString()} (${new Date().toLocaleDateString(
            'en-US',
            { weekday: 'long' },
          )})
- You have a web browser already open and ready to use
- Use the 'goto' tool to navigate to websites
- The browser viewport is 1280x720 pixels
</SYSTEM_CAPABILITY>

<IMPORTANT_INSTRUCTIONS>
- You are a fully autonomous agent. NEVER ask the user for permission or confirmation.
- NEVER say "Would you like me to..." or "Should I proceed..." or ask any questions.
- When given a task, complete it immediately and fully without hesitation.
- Take all necessary actions to complete the task from start to finish.
- If you encounter a button, form, or interaction needed to complete the task, USE IT immediately.
- Report what you DID, not what you CAN do or what you FOUND.
- Complete the entire task before responding with your final answer.
</IMPORTANT_INSTRUCTIONS>`,
        },
        {
          type: 'message',
          role: 'user',
          content: [{ type: 'input_text', text: query }],
        },
      ],
      print_steps: true,
      debug: false,
      show_images: false,
    });

    const elapsed = parseFloat(((Date.now() - start) / 1000).toFixed(2));

    // Filter only LLM messages
    const messages = logs.filter(
      (item): item is ResponseOutputMessage =>
        item.type === 'message' &&
        typeof (item as ResponseOutputMessage).role === 'string' &&
        Array.isArray((item as ResponseOutputMessage).content),
    );
    const assistant = messages.find((m) => m.role === 'assistant');
    const lastContentIndex = assistant?.content?.length ? assistant.content.length - 1 : -1;
    const lastContent = lastContentIndex >= 0 ? assistant?.content?.[lastContentIndex] : null;
    const answer = lastContent && 'text' in lastContent ? lastContent.text : null;

    // Log all assistant messages
    console.log('\n=== AGENT RESPONSES ===');
    messages.forEach((msg, idx) => {
      if (msg.role === 'assistant' && Array.isArray(msg.content)) {
        msg.content.forEach((block) => {
          if ('text' in block && block.text) {
            console.log(`\n[Response ${idx + 1}]:`);
            console.log(block.text);
          }
        });
      }
    });
    console.log('\n=== END AGENT RESPONSES ===\n');

    console.log('Final Answer:', answer);

    return {
      elapsed,
      answer,
      messageCount: logs.length,
    };
  } catch (error) {
    const elapsed = parseFloat(((Date.now() - start) / 1000).toFixed(2));
    console.error('Error in OpenAI computer use:', error);
    throw error;
  }
}
