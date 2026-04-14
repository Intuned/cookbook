import OpenAI from 'openai';
import type {
  ResponseItem,
  ResponseInputItem,
  ResponseOutputMessage,
  ResponseOutputText,
  ResponseFunctionToolCallItem,
  ResponseFunctionToolCallOutputItem,
  ResponseComputerToolCall,
  ResponseComputerToolCallOutputItem,
  Tool,
} from 'openai/resources/responses/responses.js';

import * as utils from './utils';
import type { PlaywrightComputer } from './computer';

type ComputerAction = {
  type: string;
  [key: string]: unknown;
};

export class Agent {
  private model: string;
  private computer: PlaywrightComputer;
  private tools: Tool[];
  private print_steps = true;
  private debug = false;
  private show_images = false;
  private openai: OpenAI;
  private ackCb: (msg: string) => boolean;

  constructor(opts: {
    model?: string;
    computer: PlaywrightComputer;
    tools?: Tool[];
    acknowledge_safety_check_callback?: (msg: string) => boolean;
    apiKey: string;
    baseURL?: string;
  }) {
    this.model = opts.model ?? 'gpt-5.4';
    this.computer = opts.computer;
    this.openai = new OpenAI({ apiKey: opts.apiKey, baseURL: opts.baseURL });
    this.tools = [...(opts.tools ?? [])];
    this.ackCb = opts.acknowledge_safety_check_callback ?? ((): boolean => true);

    this.tools.push({ type: 'computer' } as unknown as Tool);
  }

  private debugPrint(...args: unknown[]): void {
    if (this.debug) {
      console.warn('--- debug:agent:debugPrint');
      try {
        console.dir(
          args.map((msg) => utils.sanitizeMessage(msg as ResponseItem)),
          { depth: null },
        );
      } catch {
        console.dir(args, { depth: null });
      }
    }
  }

  private async handleItem(item: ResponseItem): Promise<ResponseItem[]> {
    if (item.type === 'message' && this.print_steps) {
      const msg = item as ResponseOutputMessage;
      const c = msg.content;
      const textBlocks = Array.isArray(c)
        ? c
            .filter(
              (block): block is ResponseOutputText =>
                block.type === 'output_text' && typeof block.text === 'string',
            )
            .map((block) => block.text)
        : [];
      if (textBlocks.length > 0) console.log(textBlocks.join('\n'));
    }

    if (item.type === 'function_call') {
      const fc = item as ResponseFunctionToolCallItem;
      const argsObj = JSON.parse(fc.arguments) as Record<string, unknown>;
      if (this.print_steps) console.log(`${fc.name}(${JSON.stringify(argsObj)})`);
      
      const fn = (this.computer as unknown as Record<string, unknown>)[fc.name];
      if (typeof fn === 'function') {
        await (fn as (args: Record<string, unknown>) => unknown)(argsObj);
      }
      
      return [
        {
          type: 'function_call_output',
          call_id: fc.call_id,
          output: 'success',
        } as unknown as ResponseFunctionToolCallOutputItem,
      ];
    }

    if (item.type === 'computer_call') {
      const cc = item as ResponseComputerToolCall;
      const actions = ((cc as unknown as { actions?: ComputerAction[] }).actions ??
        [cc.action]) as ComputerAction[];
      for (const action of actions) {
        const { type: actionType, ...actionArgs } = action;
        if (this.print_steps) console.log(`${actionType}(${JSON.stringify(actionArgs)})`);

        const fn = (this.computer as unknown as Record<string, unknown>)[actionType];
        if (typeof fn === 'function') {
          await (fn as (args: Record<string, unknown>) => unknown)(actionArgs);
        }
      }

      const screenshot = await this.computer.screenshot();
      const pending = cc.pending_safety_checks ?? [];
      for (const { message } of pending) {
        if (message && !this.ackCb(message)) {
          throw new Error(`Safety check failed: ${message}`);
        }
      }

      const out: Omit<ResponseComputerToolCallOutputItem, 'id'> = {
        type: 'computer_call_output',
        call_id: cc.call_id,
        output: {
          type: 'computer_screenshot',
          image_url: `data:image/png;base64,${screenshot}`,
        },
      };
      return [out as ResponseItem];
    }

    return [];
  }

  async runFullTurn(opts: {
    messages: ResponseInputItem[];
    print_steps?: boolean;
    debug?: boolean;
    show_images?: boolean;
  }): Promise<ResponseItem[]> {
    this.print_steps = opts.print_steps ?? true;
    this.debug = opts.debug ?? false;
    this.show_images = opts.show_images ?? false;
    const newItems: ResponseItem[] = [];
    let currentInput: ResponseInputItem[] = [...opts.messages];
    let previousResponseId: string | null = null;

    while (
      newItems.length === 0 ||
      (newItems[newItems.length - 1] as ResponseItem & { role?: string }).role !== 'assistant'
    ) {
      this.debugPrint(
        ...currentInput,
        ...(previousResponseId ? [{ previous_response_id: previousResponseId }] : []),
      );
      const response = await utils.createResponse(this.openai, {
        model: this.model,
        input: currentInput,
        previous_response_id: previousResponseId,
        tools: this.tools as OpenAI.Responses.Tool[],
      } as OpenAI.Responses.ResponseCreateParams);
      if (!response.output) throw new Error('No output from model');
      previousResponseId =
        typeof (response as { id?: unknown }).id === 'string'
          ? ((response as { id: string }).id)
          : null;
      currentInput = [];
      for (const msg of response.output as ResponseItem[]) {
        const handledItems = await this.handleItem(msg);
        newItems.push(msg, ...handledItems);
        currentInput.push(...(handledItems as ResponseInputItem[]));
      }
    }

    // Return sanitized messages if show_images is false
    return !this.show_images
      ? newItems.map((msg) => utils.sanitizeMessage(msg) as ResponseItem)
      : newItems;
  }
}
