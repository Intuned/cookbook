import { attemptStore } from "@intuned/runtime";

/**
 * Setup Hook - Runs before your API executes
 *
 * Purpose: Prepare data, configuration, or state that your API will need
 *
 * This hook demonstrates:
 * 1. Storing the CDP URL for browser connection
 * 2. Storing API metadata (name and parameters)
 * 3. Adding custom configuration or computed values
 * 4. Setting up timestamps for tracking
 */
export default async function setupContext({
  cdpUrl,
  apiName,
  apiParameters,
}: {
  cdpUrl: string;
  apiName: string;
  apiParameters: any;
}) {
  console.log("🔧 Setup Hook: Preparing environment...");

  // 1. Store CDP URL for browser operations
  attemptStore.set("cdpUrl", cdpUrl);
  console.log(`  ✓ CDP URL stored: ${cdpUrl}`);

  // 2. Store API metadata for reference
  attemptStore.set("apiName", apiName);
  attemptStore.set("apiParameters", apiParameters);
  console.log(`  ✓ API Name: ${apiName}`);
  console.log(`  ✓ Parameters:`, apiParameters);

  // 3. Add execution timestamp
  const startTime = new Date().toISOString();
  attemptStore.set("executionStartTime", startTime);
  console.log(`  ✓ Execution Start Time: ${startTime}`);

  // 4. Custom configuration example
  const config = {
    timeout: 30000,
    retries: 3,
  };
  attemptStore.set("config", config);
  console.log(`  ✓ Configuration stored:`, config);

  // 5. Computed values example
  const userAgent = "Intuned-Bot/1.0";
  attemptStore.set("userAgent", userAgent);
  console.log(`  ✓ User Agent: ${userAgent}`);

  console.log("🔧 Setup Hook: Complete!\n");
}
