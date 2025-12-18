import { z } from "zod";
import { BrowserContext, Page } from "playwright";
import { goToUrl } from "@intuned/browser";

import {
  getConsultationsByEmailSchema,
  Consultation,
} from "../utils/typesAndSchemas";

type Params = z.infer<typeof getConsultationsByEmailSchema>;

async function searchByEmail(page: Page, email: string) {
  const searchInput = page.locator(
    "input[placeholder='Search by name, email, or phone']"
  );
  await searchInput.waitFor({ state: "visible" });
  await searchInput.fill(email);

  const searchButton = page.locator("#search-btn");
  await searchButton.click();

  // Wait for search results to load
  await page.waitForTimeout(1000);
}

async function findConsultationItems(page: Page) {
  const consultationItems = await page.locator(".consultation-item").all();
  console.log(`Found ${consultationItems.length} consultations`);
  return consultationItems;
}

async function extractConsultationsData(
  consultationItems: any[]
): Promise<Consultation[]> {
  const consultations: Consultation[] = [];

  for (const consultationItem of consultationItems) {
    try {
      // Extract the consultation ID
      const idElement = consultationItem.locator(".consultation-id");
      const id = await idElement.textContent();

      // Extract the status
      const statusElement = consultationItem.locator(".consultation-status");
      const status = await statusElement.textContent();

      // Extract client name (using .data-value to get clean text)
      const clientNameElement = consultationItem.locator(
        ".client-name .data-value"
      );
      const clientName = await clientNameElement.textContent();

      // Extract client email (using .data-value to get clean text)
      const emailElement = consultationItem.locator(
        ".client-email .data-value"
      );
      const email = await emailElement.textContent();

      // Extract client phone (using .data-value to get clean text)
      const phoneElement = consultationItem.locator(
        ".client-phone .data-value"
      );
      const phone = await phoneElement.textContent();

      // Extract consultation date (using .data-value to get clean text)
      const dateElement = consultationItem.locator(
        ".consultation-date .data-value"
      );
      const date = await dateElement.textContent();

      // Extract consultation time (using .data-value to get clean text)
      const timeElement = consultationItem.locator(
        ".consultation-time .data-value"
      );
      const time = await timeElement.textContent();

      // Extract consultation topic (using .data-value to get clean text)
      const topicElement = consultationItem.locator(
        ".consultation-topic .data-value"
      );
      const topic = await topicElement.textContent();

      // Add the consultation to our list
      consultations.push({
        id: id?.trim() || "",
        status: status?.trim() || "",
        clientName: clientName?.trim() || "",
        email: email?.trim() || "",
        phone: phone?.trim() || "",
        date: date?.trim() || "",
        time: time?.trim() || "",
        topic: topic?.trim() || "",
      });

      console.log(`Successfully extracted consultation: ${id}`);
    } catch (error) {
      // If extraction fails for a single consultation, log it but continue with others
      console.error(`Failed to extract consultation data: ${error}`);
      continue;
    }
  }

  return consultations;
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
): Promise<Consultation[]> {
  // Validate params using Zod schema
  const { email } = getConsultationsByEmailSchema.parse(params);

  // Step 1: Navigate to the consultations list page
  await goToUrl({
    page: page,
    url: "https://sandbox.intuned.dev/consultations/list",
  });

  // Step 2: Wait for the consultations list container to be visible
  // This ensures the page has loaded before we try to extract data
  const consultationsList = page.locator("#consultations-list");
  await consultationsList.waitFor({ state: "visible" });

  // Step 3: Search by email
  await searchByEmail(page, email);

  // Step 4: Find all consultation items on the page
  // Each consultation item has the class "consultation-item"
  const consultationItems = await findConsultationItems(page);

  // Step 5: Extract data from each consultation item
  const consultations = await extractConsultationsData(consultationItems);

  // Step 6: Return all extracted consultations
  console.log(`Successfully extracted ${consultations.length} consultations`);

  return consultations;
}
