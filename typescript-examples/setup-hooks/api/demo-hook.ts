import type { Page, BrowserContext } from "playwright";
import { attemptStore } from "@intuned/runtime";
import { goToUrl } from "@intuned/browser";
import {
  demoHookParamsSchema,
  type DemoHookParams,
  type HookDemoResult,
} from "../utils/typesAndSchemas";

export default async function handler(
  params: DemoHookParams,
  page: Page,
  _context: BrowserContext
): Promise<HookDemoResult> {
  // Validate parameters using Zod schema
  const validationResult = demoHookParamsSchema.safeParse(params);

  if (!validationResult.success) {
    const errors = validationResult.error.errors
      .map((err) => `${err.path.join(".")}: ${err.message}`)
      .join(", ");
    throw new Error(`Parameter validation failed: ${errors}`);
  }

  const { message = "Hello from Setup Hooks!" } = validationResult.data;
  console.log("=== Setup Hooks Demo API ===\n");

  // Step 1: Retrieve data that was stored by the setup hook
  console.log("📦 Retrieving data from setup hook...\n");

  const cdpUrl = attemptStore.get("cdpUrl") as string;
  const apiName = attemptStore.get("apiName") as string;
  const apiParameters = attemptStore.get("apiParameters");
  const executionStartTime = attemptStore.get("executionStartTime") as string;
  const config = attemptStore.get("config");
  const userAgent = attemptStore.get("userAgent") as string;

  console.log("✓ Data retrieved from attemptStore:");
  console.log(`  - CDP URL: ${cdpUrl}`);
  console.log(`  - API Name: ${apiName}`);
  console.log(`  - Execution Start: ${executionStartTime}`);
  console.log(`  - User Agent: ${userAgent}`);
  console.log(`  - Config:`, config);

  // Step 2: Use the page (connected via CDP thanks to the hook)
  console.log("\n🌐 Navigating to example.com...");
  await goToUrl({
    page,
    url: "https://example.com",
  })
  const pageTitle = await page.title();
  console.log(`✓ Page Title: ${pageTitle}`);

  // Step 3: Calculate execution time
  const endTime = new Date();
  const startTime = new Date(executionStartTime);
  const executionMs = endTime.getTime() - startTime.getTime();
  const executionTime = `${executionMs}ms`;
  console.log(`\n⏱️  Total Execution Time: ${executionTime}`);

  console.log("\n✅ Setup Hooks Demo Complete!\n");

  return {
    message,
    dataFromHook: {
      cdpUrl,
      apiName,
      apiParameters,
      executionStartTime,
      config,
      userAgent,
    },
    executionTime,
    pageTitle,
  };
}
