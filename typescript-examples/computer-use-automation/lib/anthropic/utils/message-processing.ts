import type { BetaMessage, BetaMessageParam, BetaToolResultBlock, BetaContentBlock, BetaLocalContentBlock } from '../types/beta';

export function responseToParams(response: BetaMessage): BetaContentBlock[] {
  return response.content.map(block => {
    if (block.type === 'text' && block.text) {
      return { type: 'text', text: block.text };
    }
    if (block.type === 'thinking') {
      const { thinking, signature, ...rest } = block;
      return { ...rest, thinking, ...(signature && { signature }) };
    }
    return block as BetaContentBlock;
  });
}

export function maybeFilterToNMostRecentImages(
  messages: BetaMessageParam[],
  imagesToKeep: number,
  minRemovalThreshold: number
): void {
  if (!imagesToKeep) return;

  const toolResultBlocks = messages
    .flatMap(message => Array.isArray(message?.content) ? message.content : [])
    .filter((item): item is BetaToolResultBlock => 
      typeof item === 'object' && item.type === 'tool_result'
    );

  const totalImages = toolResultBlocks.reduce((count, toolResult) => {
    if (!Array.isArray(toolResult.content)) return count;
    return count + toolResult.content.filter(
      content => typeof content === 'object' && content.type === 'image'
    ).length;
  }, 0);

  let imagesToRemove = Math.floor((totalImages - imagesToKeep) / minRemovalThreshold) * minRemovalThreshold;

  for (const toolResult of toolResultBlocks) {
    if (Array.isArray(toolResult.content)) {
      toolResult.content = toolResult.content.filter(content => {
        if (typeof content === 'object' && content.type === 'image') {
          if (imagesToRemove > 0) {
            imagesToRemove--;
            return false;
          }
        }
        return true;
      });
    }
  }
}

const PROMPT_CACHING_BETA_FLAG = 'prompt-caching-2024-07-31';

export function injectPromptCaching(messages: BetaMessageParam[]): void {
  let breakpointsRemaining = 3;
  
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (!message) continue;
    if (message.role === 'user' && Array.isArray(message.content)) {
      if (breakpointsRemaining > 0) {
        breakpointsRemaining--;
        const lastContent = message.content[message.content.length - 1];
        if (lastContent) {
          (lastContent as BetaLocalContentBlock).cache_control = { type: 'ephemeral' };
        }
      } else {
        const lastContent = message.content[message.content.length - 1];
        if (lastContent) {
          delete (lastContent as BetaLocalContentBlock).cache_control;
        }
        break;
      }
    }
  }
}

export { PROMPT_CACHING_BETA_FLAG };

