/**
 * ai-fallback — wrap a risky deterministic step so that a REAL failure
 * (broken selector, TimeoutError, overlay interception) falls back to a
 * Stagehand computer-use agent driving the same live browser, while
 * business outcomes (ClientError) pass through untouched.
 *
 * Trust rules:
 *  - ClientError thrown by the step is NEVER shown to the AI — rethrown as-is.
 *  - The AI gets one attempt, hard time-capped, pinned to the step's tab.
 *  - The AI's own "success" is never trusted: `verify` re-checks the UI
 *    deterministically and produces the return value.
 *  - `verify` throwing ClientError propagates (the AI uncovered a legit
 *    business outcome, e.g. a slot-conflict dialog).
 *  - Anything else fails open: the ORIGINAL error is rethrown.
 *  - On dry runs the prompt forbids committing clicks (Save/Confirm/Delete/…),
 *    even if the instruction itself asks to advance.
 *
 * Every invocation records an entry in the attempt's `ai_fallback` meta
 * ({ used, invocations[] } — see initAiFallbackMeta) so callers can see
 * whether/where/why AI was needed, including the error that triggered it.
 */
import type { Page } from "playwright";
import type { ZodTypeAny } from "zod";

import {
  attemptStore,
  extendTimeout,
  getAiGatewayConfig,
} from "@intuned/runtime";
import { ClientError } from "./errors";

const AI_MODEL = "anthropic/claude-sonnet-5";
const MAX_STEPS = 40;
// A legitimate multi-step rescue can run for a while; this cap only guards
// against a hung agent, not a slow one.
const AGENT_TIMEOUT_MS = 360_000;
const LOG_KEY = "aiFallbackLog";

/** Final commits blocked on dry runs when a call site doesn't name its own. */
export const DEFAULT_COMMIT_ACTIONS = [
  "Save",
  "Submit",
  "Confirm",
  "Delete",
  "Create New Patient",
  "Confirm Create New Patient",
];

/** The original error that triggered the fallback, structured for consumers. */
export interface AiFallbackTriggerError {
  name: string;
  message: string;
}

export interface AiFallbackEntry {
  step: string;
  where: string;
  /** The original error that triggered the fallback. */
  trigger_error: AiFallbackTriggerError;
  instruction: string;
  outcome: "success" | "failed";
  agent_summary: string | null;
  duration_ms: number;
  /** True when the run was a dry run (prompt forbade committing clicks). */
  dry_run_safe: boolean;
  /**
   * How success was confirmed: "deterministic" (selector-based check),
   * "ai_extract" (independent read-only extract, code asserted), or false.
   */
  verified: "deterministic" | "ai_extract" | false;
}

/**
 * AI-observed verification: a SEPARATE read-only extract() call reads the page
 * (rot-proof — no selectors), then `assert` — plain code — decides success.
 * The acting agent never grades itself; the judgment stays deterministic.
 */
export interface AiExtractVerify<T> {
  /** What to read off the page, e.g. "Read the value shown in the 'Scheduler Dates' filter input". */
  observe: string;
  /** Tight zod schema for the observation, e.g. z.object({ value: z.string() }). */
  schema: ZodTypeAny;
  /** Code decides: return the value on success; throw plain Error (not done) or ClientError (business outcome). */
  assert: (data: any, page: Page) => T | Promise<T>;
}

export interface AiFallbackOptions<T> {
  /** Machine-ish step name, e.g. "fill_booking_form". */
  step: string;
  /** Human location, e.g. "fillBookingForm (add_edit_event.php)". */
  where: string;
  /** The EXACT tab the step operates on (wizard popup / visit page / main page). */
  page: Page;
  /** Plain-English, single scoped step. Never lets the AI choose WHAT to act on. */
  instruction: string;
  dryRun: boolean;
  /**
   * The FINAL committing actions of this flow (button names), forbidden on dry
   * runs. Mid-flow clicks (Search, Continue, opening dialogs) are always
   * allowed — only these commits are blocked when dryRun is true. On real runs
   * nothing is blocked: performing one of these (when the instruction asks) is
   * a legitimate job for the fallback. Defaults to DEFAULT_COMMIT_ACTIONS.
   */
  commitActions?: string[];
  /**
   * Agent tool mode. "dom" (default) targets elements by description —
   * immune to coordinate-scaling misclicks. Use "hybrid" only for steps that
   * truly need coordinates (e.g. drags).
   */
  agentMode?: "dom" | "hybrid";
  /**
   * Post-AI success check — decides the real outcome; its return value is what
   * withAiFallback returns. Two forms:
   *  - AiExtractVerify (preferred): independent read-only AI extract + code assert.
   *  - function: deterministic selector-based check, for verifies that must
   *    produce a runtime object (e.g. a Page) or demand provable-DOM confidence.
   * Either way: throw plain Error if the step isn't done; throw ClientError to
   * surface a legit business outcome discovered after the AI acted.
   */
  verify: ((page: Page) => Promise<T>) | AiExtractVerify<T>;
}

/**
 * The envelope-facing shape: `used` flips to true on the first fallback
 * invocation; `invocations` collects one entry per invocation, in order, so
 * multiple rescues in one run are all reported.
 */
export interface AiFallbackMeta {
  used: boolean;
  invocations: AiFallbackEntry[];
}

/**
 * Create (and reset) this attempt's ai_fallback meta, returning the live
 * object. Pass it straight into the envelope meta — mutations are visible
 * because okEnvelope/errorEnvelope spread meta AFTER the body settles (so it
 * appears in BOTH success and ClientError failure envelopes):
 *
 *   withErrorEnvelope({ dry_run, ai_fallback: initAiFallbackMeta() }, ...)
 */
export function initAiFallbackMeta(): AiFallbackMeta {
  const meta: AiFallbackMeta = { used: false, invocations: [] };
  attemptStore.set(LOG_KEY, meta);
  return meta;
}

function getMeta(): AiFallbackMeta {
  const existing = attemptStore.get(LOG_KEY) as AiFallbackMeta | undefined;
  if (existing && Array.isArray(existing.invocations)) return existing;
  return initAiFallbackMeta();
}

/** The cdpUrl from the setupContext hook may be an http endpoint — resolve it to ws://. */
async function getWebSocketUrl(cdpUrl: string): Promise<string> {
  if (cdpUrl.includes("ws://") || cdpUrl.includes("wss://")) {
    return cdpUrl;
  }
  const versionUrl = cdpUrl.endsWith("/")
    ? `${cdpUrl}json/version`
    : `${cdpUrl}/json/version`;
  const response = await fetch(versionUrl);
  const data = await response.json();
  return data.webSocketDebuggerUrl;
}

let stagehandPromise: Promise<any> | null = null;

async function getStagehand(): Promise<any> {
  if (!stagehandPromise) {
    stagehandPromise = (async () => {
      const { baseUrl, apiKey } = await getAiGatewayConfig();
      const cdpUrl = attemptStore.get("cdpUrl") as string;
      if (!cdpUrl) {
        throw new Error(
          "ai-fallback: no cdpUrl in attemptStore (setupContext hook missing?)",
        );
      }
      const webSocketUrl = await getWebSocketUrl(cdpUrl);
      // Anthropic models live at {gateway}/v1/messages; the AI-SDK anthropic
      // client appends "/messages", so point it at {gateway}/v1. baseUrl comes
      // WITHOUT a trailing slash — join carefully.
      const anthropicBase = baseUrl.endsWith("/")
        ? `${baseUrl}v1`
        : `${baseUrl}/v1`;
      const { Stagehand: StagehandCtor } =
        await import("@browserbasehq/stagehand");
      const stagehand = new StagehandCtor({
        env: "LOCAL",
        localBrowserLaunchOptions: { cdpUrl: webSocketUrl },
        model: { modelName: AI_MODEL, apiKey, baseURL: anthropicBase },
        // Compact step trace so slow/stuck rescues are diagnosable from run logs.
        logger: (line: unknown) => {
          const l = line as { category?: string; message?: string };
          if (l?.message)
            console.info(
              `[stagehand:${l.category ?? "-"}] ${String(l.message).slice(0, 200)}`,
            );
        },
      });
      await stagehand.init();
      return stagehand;
    })();
    // Don't cache a failed init — a later fallback may retry cleanly.
    stagehandPromise.catch(() => {
      stagehandPromise = null;
    });
  }
  return stagehandPromise;
}

/** Test hook: drop the cached Stagehand so init failures can be simulated. */
export function __resetAiFallbackStagehand(): void {
  stagehandPromise = null;
}

function composePrompt<T>(opts: AiFallbackOptions<T>, err: Error): string {
  const lines = [
    "You are a recovery agent. A deterministic browser-automation step just failed on the page currently shown in the active tab; the page is already in the right state.",
    "",
    `FAILED STEP: ${opts.step} — ${opts.where}`,
    `ERROR: ${String(err.message ?? err).slice(0, 500)}`,
    "",
    `YOUR TASK: ${opts.instruction}`,
    "",
    "RULES:",
    "- Act ONLY on the current screen of the active tab. Do NOT navigate to another URL, use browser history, or open new tabs.",
    "- Do exactly what the task says. Do NOT improvise a different value, option, row, or target, even if the requested one seems unavailable.",
    "- If you cannot complete the task exactly as instructed, stop and report failure instead of doing something else.",
  ];
  if (opts.dryRun) {
    const commits = (opts.commitActions ?? DEFAULT_COMMIT_ACTIONS)
      .map((c) => `"${c}"`)
      .join(", ");
    lines.push(
      `- THIS IS A PREVIEW (DRY) RUN. Mid-flow interactions are fine (searching, filtering, opening dropdowns/dialogs, continuing through a widget), but you must NOT click these FINAL committing buttons: ${commits} — EVEN IF THE TASK ABOVE ASKS YOU TO. If the task requires one of them, do everything up to that click, then stop and report.`,
    );
  }
  return lines.join("\n");
}

function summarizeAgentResult(result: unknown): string {
  if (typeof result === "string") return result.slice(0, 400);
  if (result && typeof result === "object") {
    const r = result as Record<string, unknown>;
    const msg = typeof r.message === "string" ? r.message : JSON.stringify(r);
    const ok = "success" in r ? ` (agent reported success=${r.success})` : "";
    return `${msg.slice(0, 400)}${ok}`;
  }
  return String(result);
}

function withTimeout<V>(
  promise: Promise<V>,
  ms: number,
  label: string,
): Promise<V> {
  let timer: NodeJS.Timeout;
  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    new Promise<never>((_, reject) => {
      timer = setTimeout(
        () => reject(new Error(`${label} timed out after ${ms}ms`)),
        ms,
      );
    }),
  ]);
}

export async function withAiFallback<T>(
  opts: AiFallbackOptions<T>,
  fn: () => Promise<T>,
): Promise<T> {
  try {
    return await fn();
  } catch (originalError) {
    // Business outcomes are not the AI's to fix.
    if (originalError instanceof ClientError) throw originalError;
    const err = originalError as Error;

    const entry: AiFallbackEntry = {
      step: opts.step,
      where: opts.where,
      trigger_error: {
        name: err.name ?? "Error",
        message: String(err.message ?? err).slice(0, 500),
      },
      instruction: opts.instruction,
      outcome: "failed",
      agent_summary: null,
      duration_ms: 0,
      dry_run_safe: opts.dryRun,
      verified: false,
    };
    const meta = getMeta();
    meta.used = true;
    meta.invocations.push(entry);
    console.warn(
      `[ai-fallback] step "${opts.step}" failed (${entry.trigger_error.name}: ${entry.trigger_error.message}) — invoking AI agent`,
    );

    const started = Date.now();
    try {
      extendTimeout();
      const stagehand = await getStagehand();
      // Pin the agent to the tab this step operates on: `page` in the execute
      // options binds it to this exact Playwright Page (bringToFront alone is
      // NOT enough — Stagehand latches onto the active tab at init otherwise),
      // and fronting it keeps the headful viewport rendering for vision.
      await opts.page.bringToFront();
      const agent = stagehand.agent({ mode: opts.agentMode ?? "dom" });
      const result = await withTimeout(
        agent.execute({
          instruction: composePrompt(opts, err),
          maxSteps: MAX_STEPS,
          page: opts.page,
        }),
        AGENT_TIMEOUT_MS,
        `ai-fallback agent for "${opts.step}"`,
      );
      entry.agent_summary = summarizeAgentResult(result);
    } catch (agentError) {
      entry.duration_ms = Date.now() - started;
      entry.agent_summary = `agent error: ${String((agentError as Error).message ?? agentError).slice(0, 300)}`;
      console.warn(`[ai-fallback] FAILED ${JSON.stringify(entry)}`);
      throw originalError;
    }

    // The acting agent's word is not the outcome — the verify decides. Either
    // a selector check (function form) or an independent read-only extract
    // whose result is asserted by plain code (AiExtractVerify form).
    try {
      let value: T;
      if (typeof opts.verify === "function") {
        value = await opts.verify(opts.page);
        entry.verified = "deterministic";
      } else {
        const stagehand = await getStagehand();
        const data = await stagehand.extract(
          opts.verify.observe,
          opts.verify.schema,
          { page: opts.page },
        );
        value = await opts.verify.assert(data, opts.page);
        entry.verified = "ai_extract";
      }
      entry.outcome = "success";
      entry.duration_ms = Date.now() - started;
      console.warn(
        `[ai-fallback] recovered step "${opts.step}" ${JSON.stringify(entry)}`,
      );
      return value;
    } catch (verifyError) {
      entry.duration_ms = Date.now() - started;
      if (verifyError instanceof ClientError) {
        entry.agent_summary = `${entry.agent_summary ?? ""} | verify surfaced business outcome: ${verifyError.code}`;
        console.warn(
          `[ai-fallback] business outcome after AI ${JSON.stringify(entry)}`,
        );
        throw verifyError;
      }
      entry.agent_summary = `${entry.agent_summary ?? ""} | verify failed: ${String(
        (verifyError as Error).message ?? verifyError,
      ).slice(0, 200)}`;
      console.warn(`[ai-fallback] FAILED (verify) ${JSON.stringify(entry)}`);
      throw originalError;
    }
  }
}
