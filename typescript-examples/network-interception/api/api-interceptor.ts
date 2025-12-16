import { Page, BrowserContext, Response } from "playwright";
import { goToUrl, withNetworkSettledWait } from "@intuned/browser";
import { z } from "zod";
import {
  consultationSchema,
  apiInterceptorParamsSchema,
} from "../utils/typesAndSchemas.js";

type Params = z.infer<typeof apiInterceptorParamsSchema>;

type Consultation = z.infer<typeof consultationSchema>;

// Global variable to store captured API data
let apiData: Consultation[] = [];

/**
 * Creates a response handler that captures responses matching the pattern.
 * Replace the pattern with the appropriate one for your API.
 */
function createResponseHandler(
  pattern: string
): (response: Response) => Promise<void> {
  return async (response: Response): Promise<void> => {
    if (response.url().includes(pattern)) {
      try {
        const data = await response.json();
        if (Array.isArray(data)) {
          apiData.push(...data);
        } else {
          apiData.push(data);
        }
      } catch {
        // Response might not be JSON
      }
    }
  };
}

/**
 * Intercepts network requests to capture paginated API data.
 * Clicks the "Next" button to load more pages and captures API responses.
 *
 * Example params:
{
    "url": "https://sandbox.intuned.dev/consultations/list",
    "api_pattern": "/rest/v1/consultations",
    "max_pages": 3
}
 *
 * This function:
 * 1. Sets up a response listener for the specified pattern
 * 2. Navigates to the URL and captures initial data
 * 3. Clicks the next page button to load more data
 * 4. Returns all captured API data
 */
async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
): Promise<Consultation[]> {
  apiData = [];

  if (!params || !params.url) {
    throw new Error("url is required in params");
  }

  const url = params.url;
  const apiPattern = params.api_pattern || "/api/";
  const maxPages = params.max_pages || 10;

  console.log(`Navigating to: ${url}`);
  console.log(`Listening for API pattern: ${apiPattern}`);
  console.log(`Max pages: ${maxPages}`);

  // Create and attach the response handler
  const responseHandler = createResponseHandler(apiPattern);
  page.on("response", responseHandler);

  try {
    // Navigate and wait until the network is settled (initial page load)
    await withNetworkSettledWait(
      async (page) => {
        await goToUrl({ page, url });
      },
      {
        page,
        timeoutInMs: 20000,
      }
    );

    console.log(`Initial load captured ${apiData.length} items`);

    // Pagination: click next button to load more pages
    let currentPage = 1;

    while (currentPage < maxPages) {
      // Check if next button exists and is visible
      // Replace "#next-page-btn" with the appropriate selector for your store
      const nextButton = await page.$("#next-page-btn");

      if (!nextButton) {
        console.log("Next button not found, stopping pagination");
        break;
      }

      const isDisabled = await nextButton.isDisabled();
      if (isDisabled) {
        console.log("Next button is disabled, reached end of data");
        break;
      }

      const itemsBefore = apiData.length;

      // Click next button and wait for network to settle
      await withNetworkSettledWait(
        async () => {
          await nextButton.click();
        },
        {
          page,
          timeoutInMs: 20000,
        }
      );

      const itemsAfter = apiData.length;
      const newItems = itemsAfter - itemsBefore;

      console.log(`Page ${currentPage + 1}: captured ${newItems} new items`);

      // If no new items were captured, stop pagination
      if (newItems === 0) {
        console.log("No new items captured, stopping pagination");
        break;
      }

      currentPage++;
    }

    console.log(`Total items captured: ${apiData.length}`);
    return apiData;
  } finally {
    // Clean up the event listener
    page.removeListener("response", responseHandler);
  }
}

export default handler;
