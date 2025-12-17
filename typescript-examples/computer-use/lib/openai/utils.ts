import OpenAI from 'openai';
import { type ResponseItem } from 'openai/resources/responses/responses.js';

export function sanitizeMessage(msg: ResponseItem): ResponseItem {
  const sanitizedMsg = { ...msg } as ResponseItem;
  if (
    sanitizedMsg.type === 'computer_call_output' &&
    typeof sanitizedMsg.output === 'object' &&
    sanitizedMsg.output !== null
  ) {
    sanitizedMsg.output = { ...sanitizedMsg.output };
    const output = sanitizedMsg.output as { image_url?: string };
    if (output.image_url) {
      output.image_url = '[omitted]';
    }
  }
  return sanitizedMsg;
}

export async function createResponse(
  openai: OpenAI,
  params: OpenAI.Responses.ResponseCreateParams,
): Promise<{ output?: OpenAI.Responses.ResponseOutputItem[] }> {
  try {
    const response = await openai.responses.create(params);
    return 'output' in response ? response : { output: undefined };
  } catch (err: unknown) {
    console.error((err as Error).message);
    throw err;
  }
}

export default {
  sanitizeMessage,
  createResponse,
};

