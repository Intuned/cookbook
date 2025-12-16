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
  // Set the browser viewport size to 1080x720 pixels
  // This ensures consistent rendering across different devices and screen sizes
  // Some websites may display different layouts or elements based on viewport size
  await page.setViewportSize({
    width: 1080,
    height: 720,
  });

  // Step 1: Validate input parameters using schema
  // This ensures all required fields are present and properly formatted
  const validatedParams = bookConsultationSchema.parse(params);

  // Extract validated parameters
  const { name, email, phone, date, time, topic } = validatedParams;

  // Step 2: Navigate to the consultation booking page
  const sandboxedUrl = "https://sandbox.intuned.dev/consultations-auth/book";
  await goToUrl({
    page: page,
    url: sandboxedUrl,
  });

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

  if (!isSuccess) {
    throw new Error("Booking completed but success confirmation unclear");
  }

  // Step 9: Return booking details
  return {
    date: date,
    time: time,
    message: `Consultation successfully booked for ${date} at ${time}`,
  };
}
