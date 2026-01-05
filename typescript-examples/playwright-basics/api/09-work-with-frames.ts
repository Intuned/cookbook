import { BrowserContext, Page } from "playwright";

/**
 * Work with Frames (iframes)
 *
 * Demonstrates interacting with iframe content:
 * - Using frameLocator for simple access
 * - Using contentFrame for more control
 */

interface Params {}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  // Using a page with iframes for demonstration
  await page.goto("https://the-internet.herokuapp.com/nested_frames");
  await page.waitForLoadState("networkidle");

  // Method 1: Using frameLocator (recommended for most cases)
  // frameLocator returns a FrameLocator that can chain with regular locators
  const topFrame = page.frameLocator('frame[name="frame-top"]');
  const leftFrame = topFrame.frameLocator('frame[name="frame-left"]');

  // Get content from nested frame
  const leftContent = await leftFrame.locator("body").textContent();

  const middleFrame = topFrame.frameLocator('frame[name="frame-middle"]');
  const middleContent = await middleFrame.locator("body").textContent();

  const rightFrame = topFrame.frameLocator('frame[name="frame-right"]');
  const rightContent = await rightFrame.locator("body").textContent();

  // Bottom frame
  const bottomFrame = page.frameLocator('frame[name="frame-bottom"]');
  const bottomContent = await bottomFrame.locator("body").textContent();

  // Method 2: Using contentFrame for more control
  // This gives you a Frame object with full access to frame methods
  const frameElement = await page.waitForSelector('frame[name="frame-bottom"]');
  const frame = await frameElement.contentFrame();

  let frameTitle = null;
  if (frame) {
    frameTitle = await frame.title();
  }

  return {
    frames: {
      left: leftContent?.trim(),
      middle: middleContent?.trim(),
      right: rightContent?.trim(),
      bottom: bottomContent?.trim(),
    },
    frameTitle,
  };
}
