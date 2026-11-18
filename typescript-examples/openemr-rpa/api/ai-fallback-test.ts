import { BrowserContext, Page } from "playwright";
import { runAiFallbackTests } from "../helpers/ai-fallback-tests";

/**
 * ai-fallback-test — runs the ai-fallback scenario suite against the Intuned
 * sandbox (NOT the OpenEMR demo). Use it to prove the helper's behavior end to
 * end with a real browser + real AI agent.
 *
 * Params: { which?: string } — a single test id ("T3"), a tier ("tier1"),
 * or "all" (default). See helpers/ai-fallback-tests.ts for the registry.
 *
 * Note: tiers 1–3 spend real AI-gateway tokens (they drive a Stagehand agent).
 * Tier 0 (T1, T2) invokes no AI.
 */
interface Params {
  which?: string;
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
): Promise<Record<string, any>> {
  const which = params?.which ?? "all";
  const results = await runAiFallbackTests(which, page, context);

  const passed = results.filter((r) => r.passed).length;
  const failed = results.length - passed;

  return {
    which,
    summary: `${passed}/${results.length} passed`,
    passed,
    failed,
    all_passed: failed === 0,
    results,
  };
}
