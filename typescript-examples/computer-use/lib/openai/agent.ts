import OpenAI from 'openai';
import {
  type ResponseItem,
  type ResponseInputItem,
  type ResponseOutputMessage,
  type ResponseFunctionToolCallItem,
  type ResponseFunctionToolCallOutputItem,
  type ResponseComputerToolCall,
  type ResponseComputerToolCallOutputItem,
  type ComputerTool,
} from 'openai/resources/responses/responses.js';

import * as utils from './utils';
import toolset from './toolset';
import type { PlaywrightComputer } from './computer';

export class Agent {
  private model: string;
  private computer: PlaywrightComputer;
  private tools: ComputerTool[];
  private print_steps = true;
  private debug = false;
  private show_images = false;
  private openai: OpenAI;
  private ackCb: (msg: string) => boolean;

  constructor(opts: {
    model?: string;
    computer: PlaywrightComputer;
    tools?: ComputerTool[];
    acknowledge_safety_check_callback?: (msg: string) => boolean;
    apiKey: string;
    baseURL?: string;
  }) {
    this.model = opts.model ?? 'computer-use-preview';
    this.computer = opts.computer;
    this.openai = new OpenAI({ apiKey: opts.apiKey, baseURL: opts.baseURL });
    this.tools = [...toolset.shared, ...(opts.tools ?? [])] as ComputerTool[];
    this.ackCb = opts.acknowledge_safety_check_callback ?? ((): boolean => true);

    const [w, h] = this.computer.getDimensions();
    this.tools.push({
      type: 'computer_use_preview',
      display_width: w,
      display_height: h,
      environment: this.computer.getEnvironment(),
    });
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
      if (Array.isArray(c) && c[0] && 'text' in c[0] && typeof c[0].text === 'string')
        console.log(c[0].text);
    }

    if (item.type === 'function_call') {
      const fc = item as ResponseFunctionToolCallItem;
      const argsObj = JSON.parse(fc.arguments) as Record<string, unknown>;
      if (this.print_steps) console.log(`${fc.name}(${JSON.stringify(argsObj)})`);
      
      const fn = (this.computer as unknown as Record<string, unknown>)[fc.name];
      if (typeof fn === 'function') {
        await (fn as (...a: unknown[]) => unknown)(...Object.values(argsObj));
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
      const { type: actionType, ...actionArgs } = cc.action;
      if (this.print_steps) console.log(`${actionType}(${JSON.stringify(actionArgs)})`);
      
      const fn = (this.computer as unknown as Record<string, unknown>)[actionType as string];
      if (typeof fn === 'function') {
        await (fn as (...a: unknown[]) => unknown)(...Object.values(actionArgs));
        const screenshot = await this.computer.screenshot();
        const pending = cc.pending_safety_checks ?? [];
        for (const { message } of pending) {
          if (!this.ackCb(message)) throw new Error(`Safety check failed: ${message}`);
        }
        const out: Omit<ResponseComputerToolCallOutputItem, 'id'> = {
          type: 'computer_call_output',
          call_id: cc.call_id,
          acknowledged_safety_checks: pending,
          output: {
            type: 'computer_screenshot',
            image_url: `data:image/webp;base64,${screenshot}`,
          },
        };
        return [out as ResponseItem];
      }
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

    while (
      newItems.length === 0 ||
      (newItems[newItems.length - 1] as ResponseItem & { role?: string }).role !== 'assistant'
    ) {
      // Add current URL to system message if in browser environment
      const inputMessages = [...opts.messages];

      if (this.computer?.getEnvironment() === 'browser') {
        const current_url = this.computer.getCurrentUrl();
        // Find system message
        const sysIndex = inputMessages.findIndex((msg) => 'role' in msg && msg.role === 'system');

        if (sysIndex >= 0) {
          const msg = inputMessages[sysIndex];
          const urlInfo = `\n- Current URL: ${current_url}`;

          if (msg && 'content' in msg) {
            if (typeof msg.content === 'string') {
              const updatedMsg = {
                ...msg,
                content: msg.content + urlInfo,
              };
              inputMessages[sysIndex] = updatedMsg as typeof msg;
            } else if (Array.isArray(msg.content) && msg.content.length > 0) {
              const updatedContent = [...msg.content];

              if (updatedContent[0] && 'text' in updatedContent[0]) {
                updatedContent[0] = {
                  ...updatedContent[0],
                  text: updatedContent[0].text + urlInfo,
                };
              }

              const updatedMsg = {
                ...msg,
                content: updatedContent,
              };
              inputMessages[sysIndex] = updatedMsg as typeof msg;
            }
          }
        }
      }

      this.debugPrint(...inputMessages, ...newItems);
      const response = await utils.createResponse(this.openai, {
        model: this.model,
        input: [...inputMessages, ...newItems],
        tools: this.tools,
        truncation: 'auto',
      });
      if (!response.output) throw new Error('No output from model');
      for (const msg of response.output as ResponseItem[]) {
        newItems.push(msg, ...(await this.handleItem(msg)));
      }
    }

    // Return sanitized messages if show_images is false
    return !this.show_images
      ? newItems.map((msg) => utils.sanitizeMessage(msg) as ResponseItem)
      : newItems;
  }
}

