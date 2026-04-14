import { BrowserContext, Page } from "playwright";
import { Stagehand, AISdkClient } from "@browserbasehq/stagehand";
import { goToUrl } from "@intuned/browser";
import { attemptStore, getAiGatewayConfig } from "@intuned/runtime";
import { z } from "zod";

const bookConsultationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  topic: z.enum([
    "web-scraping",
    "data-extraction",
    "automation",
    "api-integration",
    "other",
  ]),
});

type Params = z.infer<typeof bookConsultationSchema>;

interface BookingResult {
  success: boolean;
  date: string;
  message: string;
}

const successCheckSchema = z.object({
  success: z.boolean().describe("Whether the booking was successful"),
  message: z.string().describe("The success or error message displayed"),
});

function raiseClearAiError(e: unknown): never {
  const msg = e instanceof Error ? e.message : String(e);
  if (/credits?|quota|rate.?limit|insufficient|payment.?required|402/i.test(msg)) {
    throw new Error(
      `❌ AI credits exceeded or rate limit reached. Please check your Intuned account credit balance. (${msg})`
    );
  }
  if (e instanceof Error) throw e;
  throw new Error(String(e));
}

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

export default async function handler(
  params: Params,
  page: Page,
  _context: BrowserContext
): Promise<BookingResult> {
  // Get AI gateway config for Stagehand
  const { baseUrl, apiKey } = await getAiGatewayConfig();
  const cdpUrl = attemptStore.get("cdpUrl") as string;
  const webSocketUrl = await getWebSocketUrl(cdpUrl);
  // Create AI SDK provider with Intuned's AI gateway
  const stagehand = new Stagehand({
    env: "LOCAL",
    localBrowserLaunchOptions: {
      cdpUrl: webSocketUrl,
      downloadsPath: "./tmp",
    },
    logger: console.log,
    model: {
      modelName: "openai/gpt-5-mini",
      apiKey: apiKey,
      baseURL: baseUrl
    }
  });
  await stagehand.init();
  console.log("\nInitialized 🤘 Stagehand");

  // Validate input parameters
  const { name, email, phone, date, time, topic } =
    bookConsultationSchema.parse(params);

  let isSuccess = false;

  try {
    // Navigate to the consultation booking page
    await goToUrl({
      page,
      url: "https://sandbox.intuned.dev/consultations/book",
    });

    // Step 1: Fill name field
    try {
      await page.locator("#name-input").type(name);
      console.log("✓ Filled name with Playwright");
    } catch (e) {
      console.log(`Playwright failed for name, using Stagehand act: ${e}`);
      try {
        await stagehand.act(`Type "${name}" in the name input field`);
        console.log("✓ Filled name with Stagehand act");
      } catch (stagehandError) {
        raiseClearAiError(stagehandError);
      }
    }

    // Step 2: Fill email field
    try {
      await page.locator("#email-input").type(email);
      console.log("✓ Filled email with Playwright");
    } catch (e) {
      console.log(`Playwright failed for email, using Stagehand act: ${e}`);
      try {
        await stagehand.act(`Type "${email}" in the email input field`);
        console.log("✓ Filled email with Stagehand act");
      } catch (stagehandError) {
        raiseClearAiError(stagehandError);
      }
    }

    // Step 3: Fill phone field
    try {
      await page.locator(".phone-input").type(phone);
      console.log("✓ Filled phone with Playwright");
    } catch (e) {
      console.log(`Playwright failed for phone, using Stagehand act: ${e}`);
      try {
        await stagehand.act(`Type "${phone}" in the phone input field`);
        console.log("✓ Filled phone with Stagehand act");
      } catch (stagehandError) {
        raiseClearAiError(stagehandError);
      }
    }

    // Step 4: Fill date field
    try {
      await page.locator("#date-input").type(date);
      console.log("✓ Filled date with Playwright");
    } catch (e) {
      console.log(`Playwright failed for date, using Stagehand act: ${e}`);
      try {
        await stagehand.act(`Type "${date}" in the date input field`);
        console.log("✓ Filled date with Stagehand act");
      } catch (stagehandError) {
        raiseClearAiError(stagehandError);
      }
    }

    // Step 5: Fill time field
    try {
      await page.locator("#time-input").fill(time);
      console.log("✓ Filled time with Playwright");
    } catch (e) {
      console.log(`Playwright failed for time, using Stagehand act: ${e}`);
      try {
        await stagehand.act(`Type "${time}" in the time input field`);
        console.log("✓ Filled time with Stagehand act");
      } catch (stagehandError) {
        raiseClearAiError(stagehandError);
      }
    }

    // Step 6: Select the consultation topic from dropdown
    try {
      await page.locator("#topic-select").selectOption(topic);
      console.log("✓ Selected topic with Playwright");
    } catch (e) {
      console.log(
        `Playwright failed for topic selection, using Stagehand act: ${e}`
      );
      try {
        await stagehand.act(`Select "${topic}" from the topic dropdown`);
        console.log("✓ Selected topic with Stagehand act");
      } catch (stagehandError) {
        raiseClearAiError(stagehandError);
      }
    }

    // Step 7: Submit the booking form
    try {
      await page.locator("#submit-booking-btn").click();
      console.log("✓ Submitted form with Playwright");
    } catch (e) {
      console.log(`Playwright failed for submit, using Stagehand act: ${e}`);
      try {
        await stagehand.act(
          "Click the submit button to submit the booking form"
        );
        console.log("✓ Submitted form with Stagehand act");
      } catch (stagehandError) {
        raiseClearAiError(stagehandError);
      }
    }

    // Step 8: Wait for and verify the success modal
    try {
      await page.locator("#success-modal").waitFor({
        state: "visible",
        timeout: 5000,
      });
      const successText = await page.locator("#success-modal-title").textContent();
      isSuccess = successText?.includes("Successful") || false;
      console.log("✓ Verified success with Playwright");
    } catch (e) {
      console.log(
        `Playwright failed for verification, using Stagehand extract: ${e}`
      );
      try {
        const result = await stagehand.extract(
          "Check if the booking was successful. Look for a success modal or confirmation message.",
          successCheckSchema
        );
        isSuccess = result?.success || false;
        console.log(`✓ Verified with Stagehand extract: ${JSON.stringify(result)}`);
      } catch (stagehandError) {
        raiseClearAiError(stagehandError);
      }
    }
  } finally {
    // Cleanup Stagehand
    console.log("\nClosing 🤘 Stagehand...");
    await stagehand.close();
  }

  // Return booking details
  return {
    success: isSuccess,
    date,
    message: isSuccess
      ? `Consultation successfully booked for ${date} at ${time}`
      : "Booking completed but success confirmation unclear",
  };
}
