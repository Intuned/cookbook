import { BrowserContext, Page } from "playwright";
import { goToUrl } from "@intuned/browser";
import { z } from "zod";

import { bookConsultationSchema } from "../utils/typesAndSchemas";

type Params = z.infer<typeof bookConsultationSchema>;

async function fillPersonalInformation(
  page: Page,
  name: string,
  email: string,
  phone: string
) {
  const nameInput = page.locator("#name-input");
  await nameInput.fill(name);

  const emailInput = page.locator("#email-input");
  await emailInput.fill(email);

  const phoneInput = page.locator("#phone-input");
  await phoneInput.fill(phone);
}

async function fillSchedulingInformation(
  page: Page,
  date: string,
  time: string
) {
  const dateInput = page.locator("#date-input");
  await dateInput.fill(date);

  const timeInput = page.locator("#time-input");
  await timeInput.fill(time);
}

async function selectTopic(page: Page, topic: string) {
  const topicSelect = page.locator("#topic-select");
  await topicSelect.selectOption(topic);
}

async function submitBookingForm(page: Page) {
  const submitButton = page.locator("#submit-booking-btn");
  await submitButton.click();
}

async function waitForSuccessModal(page: Page) {
  const successModal = page.locator("#success-modal");
  await successModal.waitFor({ state: "visible", timeout: 5000 });
}

async function verifySuccessMessage(page: Page): Promise<boolean> {
  const successTitle = page.locator("#success-modal-title");
  const successText = await successTitle.textContent();
  return successText?.includes("Successful") || false;
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  try {
    // Set the browser viewport size to 1080x720 pixels
    // This ensures consistent rendering across different devices and screen sizes
    // Some websites may display different layouts or elements based on viewport size
    await page.setViewportSize({
      width: 1080,
      height: 720,
    });

    // Step 1: Validate input parameters using schema
    // This ensures all required fields are present and properly formatted
    const validatedParams = bookConsultationSchema.safeParse(params);

    if (!validatedParams.success) {
      // Return error if validation fails
      return {
        success: false,
        message: "Invalid parameters provided",
        errors: validatedParams?.error?.errors,
      };
    }

    // Extract validated parameters
    const { name, email, phone, date, time, topic } = validatedParams.data;

    // Step 2: Navigate to the consultation booking page
    const sandboxedUrl = "https://sandbox.intuned.dev/consultations-auth/book";

    // Using intuned SDK's goToUrl with enhanced reliability features:
    // - Automatic retries with exponential backoff
    // - Intelligent timeout detection
    // - Optional AI-powered loading verification
    await goToUrl({
      page: page,
      url: sandboxedUrl,
      // waitForLoadState defaults to "load", but you can specify "networkidle" or "domcontentloaded"
      // The SDK handles retries and timeout management automatically
    });

    // Original Playwright navigation (commented out):
    // - Basic navigation without retry logic
    // - Manual timeout handling required
    // - No automatic loading state verification
    // await page.goto("https://sandbox.intuned.dev/consultations/book", {
    //   waitUntil: "networkidle",
    // });

    // Step 3: Fill in personal information fields
    await fillPersonalInformation(page, name, email, phone);

    // Step 4: Fill in scheduling information
    await fillSchedulingInformation(page, date, time);

    // Step 5: Select the consultation topic from dropdown
    await selectTopic(page, topic);

    // Step 6: Submit the booking form and wait for confirmation
    await submitBookingForm(page);

    // Step 7: Wait for the success modal to appear
    // This confirms the booking was processed
    await waitForSuccessModal(page);

    // Step 8: Verify the success message is displayed
    const isSuccess = await verifySuccessMessage(page);

    // Step 9: Return success response with booking details
    return {
      success: isSuccess,
      date: date,
      message: isSuccess
        ? `Consultation successfully booked for ${date} at ${time}`
        : "Booking completed but success confirmation unclear",
    };
  } catch (error) {
    // Handle any errors that occur during the booking process
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Return error response instead of throwing
    // This makes it easier for the calling code to handle failures
    return {
      success: false,
      message: "Failed to complete booking",
      error: errorMessage,
    };
  }
}
