import type { Page, BrowserContext } from "playwright";
import { attemptStore } from "@intuned/runtime";
import {
  connectToCdpParamsSchema,
  type ConnectToCdpParams,
  type BrowserInfo,
  type PageInfo,
  type WebDriverInfo,
  type CDPConnectionResult,
} from "../utils/typesAndSchemas";

/**
 * Fetches browser information from the CDP endpoint
 */
async function getBrowserInfo(cdpUrl: string): Promise<BrowserInfo> {
  const versionUrl = cdpUrl.endsWith("/")
    ? `${cdpUrl}json/version`
    : `${cdpUrl}/json/version`;

  const response = await fetch(versionUrl);
  const data = await response.json();

  return {
    browserVersion: data["Browser"],
    protocolVersion: data["Protocol-Version"],
    userAgent: data["User-Agent"],
    webSocketDebuggerUrl: data.webSocketDebuggerUrl,
  };
}

export default async function handler(
  params: ConnectToCdpParams,
  page: Page,
  context: BrowserContext
): Promise<CDPConnectionResult> {
  console.log("=== CDP Connection Example ===\n");

  // Validate parameters using Zod schema
  const validationResult = connectToCdpParamsSchema.safeParse(params);

  if (!validationResult.success) {
    const errors = validationResult.error.errors
      .map((err) => `${err.path.join(".")}: ${err.message}`)
      .join(", ");
    throw new Error(`Parameter validation failed: ${errors}`);
  }

  const { url } = validationResult.data;

  // Get CDP URL from Intuned's runtime (provided via setupContext hook)
  const cdpUrl = attemptStore.get("cdpUrl") as string;

  console.log(`✓ CDP URL: ${cdpUrl}`);

  // Step 1: Fetch browser information via CDP
  const browserInfo = await getBrowserInfo(cdpUrl);
  console.log("\n✓ Browser Information:");
  console.log(`  - Browser Version: ${browserInfo.browserVersion}`);
  console.log(`  - Protocol Version: ${browserInfo.protocolVersion}`);
  console.log(`  - User Agent: ${browserInfo.userAgent}`);
  console.log(`  - WebSocket URL: ${browserInfo.webSocketDebuggerUrl}`);

  // Step 2: Get WebDriver capabilities using CDP
  // Create a CDP session to execute CDP commands
  const cdpSession = await context.newCDPSession(page);

  console.log("\n✓ WebDriver Information:");
  console.log("  WebDriver is a W3C standard protocol for browser automation.");
  console.log(
    "  CDP (Chrome DevTools Protocol) is Chrome-specific and more powerful."
  );

  // Get browser capabilities through CDP
  const browserCapabilities = await cdpSession.send("Browser.getVersion");

  const webDriverInfo: WebDriverInfo = {
    capabilities: {
      browserName: "chromium",
      browserVersion: browserCapabilities.product,
      platformName: process.platform,
      cdpEnabled: true,
      webDriverBiDiSupported: false, // Playwright uses CDP, not WebDriver BiDi by default
    },
    sessionId: undefined, // CDP doesn't use WebDriver session IDs
  };

  console.log(`  - Browser Name: ${webDriverInfo.capabilities.browserName}`);
  console.log(
    `  - Browser Version: ${webDriverInfo.capabilities.browserVersion}`
  );
  console.log(`  - Platform: ${webDriverInfo.capabilities.platformName}`);
  console.log(`  - CDP Enabled: ${webDriverInfo.capabilities.cdpEnabled}`);
  console.log(
    `  - WebDriver BiDi: ${webDriverInfo.capabilities.webDriverBiDiSupported}`
  );

  // Close CDP session
  await cdpSession.detach();

  // Step 3: Use the Playwright page (already connected via CDP)
  // The page object is already connected to the browser via CDP
  console.log("\n✓ Playwright page is ready and connected via CDP");

  // Step 4: Navigate to a URL
  console.log(`\n✓ Navigating to: ${url}`);
  await page.goto(url, { waitUntil: "networkidle" });

  // Step 5: Get page information
  const title = await page.title();
  const currentUrl = page.url();
  const viewport = page.viewportSize();

  const pageInfo: PageInfo = {
    title,
    url: currentUrl,
    viewport: viewport || { width: 0, height: 0 },
  };

  console.log("\n✓ Page Information:");
  console.log(`  - Title: ${pageInfo.title}`);
  console.log(`  - URL: ${pageInfo.url}`);
  console.log(
    `  - Viewport: ${pageInfo.viewport.width}x${pageInfo.viewport.height}`
  );

  console.log("\n✓ CDP connection successful!\n");

  return {
    message:
      "Successfully connected to browser via CDP and retrieved information",
    cdpUrl,
    browserInfo,
    pageInfo,
    webDriverInfo,
  };
}
