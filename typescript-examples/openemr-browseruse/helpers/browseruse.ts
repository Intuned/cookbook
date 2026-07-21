import { Agent, BrowserSession } from "browser-use";
import { ChatOpenAI } from "browser-use/llm/openai";
import { attemptStore, getAiGatewayConfig } from "@intuned/runtime";
import type { Page } from "playwright";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export const DEFAULT_MODEL = process.env.BROWSERUSE_MODEL ?? "gpt-5.6-luna";

export function getBrowserSession(): BrowserSession {
  let session = attemptStore.get("bu_session") as BrowserSession | undefined;
  if (!session) {
    const cdpUrl = attemptStore.get("cdpUrl") as string;
    session = new BrowserSession({ cdp_url: cdpUrl, keep_alive: true } as any);
    attemptStore.set("bu_session", session);
  }
  return session;
}

export async function initGateway(): Promise<void> {
  const { baseUrl, apiKey } = await getAiGatewayConfig();
  attemptStore.set("gw_base_url", baseUrl);
  attemptStore.set("gw_api_key", apiKey);
}

export function getLlm(model: string = DEFAULT_MODEL): ChatOpenAI {
  return new ChatOpenAI({
    model,
    temperature: 0,
    apiKey: attemptStore.get("gw_api_key") as string,
    baseURL: attemptStore.get("gw_base_url") as string,
  });
}

function structuredParser<T>(schema: z.ZodType<T>) {
  return {
    parse: (input: string): T => {
      try {
        return schema.parse(JSON.parse(input));
      } catch {
        return null as T;
      }
    },
    model_json_schema: () => zodToJsonSchema(schema),
  };
}

export interface RunAgentOptions<T> {
  page?: Page;
  maxSteps?: number;
  outputModel?: z.ZodType<T>;
  model?: string;
}

export async function runAgent<T = unknown>(
  task: string,
  opts: RunAgentOptions<T> = {},
): Promise<[any, T | null]> {
  if (opts.page) {
    try {
      await opts.page.bringToFront();
    } catch {}
  }

  const agent = new Agent({
    browser_session: getBrowserSession(),
    task: task + " Do not press Enter inside form fields.",
    llm: getLlm(opts.model ?? DEFAULT_MODEL),
    flash_mode: true,
    use_judge: false,
    use_vision: true,
    ...(opts.outputModel
      ? { output_model_schema: structuredParser(opts.outputModel) }
      : {}),
  } as any);

  const history = await agent.run(opts.maxSteps ?? 50);

  let structured: T | null = null;
  if (opts.outputModel) {
    try {
      structured = (history as any).structured_output ?? null;
    } catch {
      structured = null;
    }
    if (structured === null) {
      const final = history.final_result?.();
      if (final != null) {
        try {
          let data: unknown;
          if (typeof final === "string") {
            const start = final.indexOf("{");
            const end = final.lastIndexOf("}");
            const jsonText =
              start >= 0 && end > start ? final.slice(start, end + 1) : final;
            data = JSON.parse(jsonText);
          } else {
            data = final;
          }
          structured = opts.outputModel.parse(data);
        } catch {}
      }
    }
  }
  return [history, structured];
}
