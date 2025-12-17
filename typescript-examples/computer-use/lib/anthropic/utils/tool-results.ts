import type { ToolResult } from '../types/computer';
import type { BrowserToolResult } from '../tools/browser';
import type { BetaToolResultBlock, BetaTextBlock, BetaImageBlock } from '../types/beta';

export function makeApiToolResult(
  result: ToolResult | BrowserToolResult,
  toolUseId: string
): BetaToolResultBlock {
  const toolResultContent: (BetaTextBlock | BetaImageBlock)[] = [];
  let isError = false;

  if (result.error) {
    isError = true;
    toolResultContent.push({
      type: 'text',
      text: maybePrependSystemToolResult(result, result.error),
    });
  } else {
    if (result.output) {
      toolResultContent.push({
        type: 'text',
        text: maybePrependSystemToolResult(result, result.output),
      });
    }
    if (result.base64Image) {
      toolResultContent.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/png',
          data: result.base64Image,
        },
      });
    }
  }

  return {
    type: 'tool_result',
    content: toolResultContent,
    tool_use_id: toolUseId,
    is_error: isError,
  };
}

export function maybePrependSystemToolResult(result: ToolResult, resultText: string): string {
  if (result.system) {
    return `<system>${result.system}</system>\n${resultText}`;
  }
  return resultText;
}

