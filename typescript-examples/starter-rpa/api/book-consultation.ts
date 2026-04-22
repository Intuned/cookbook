import { BrowserContext, Page } from "playwright";
import { goToUrl } from "@intuned/browser";

interface Params {
  name?: string;
  email?: string;
  phone?: string;
  date?: string;
  time?: string;
  topic?: string;
}

export default async function handler(
  params: Params,
  page: Page,
  _context: BrowserContext
) {
  await goToUrl({
    page,
    url: "https://sandbox.intuned.dev/consultations/book",
  });

  await page.locator("#name-input").fill(params.name ?? "Foo Bar");
  await page.locator("#email-input").fill(params.email ?? "foo@bar.com");
  await page.locator("#phone-input").fill(params.phone ?? "1234567890");
  await page.locator("#date-input").fill(params.date ?? "2026-11-19");
  await page.locator("#time-input").fill(params.time ?? "10:00");
  await page
    .locator("#topic-select")
    .selectOption(params.topic ?? "other");

  await page.locator("#submit-booking-btn").click();

  const modal = page.locator("#success-modal");
  await modal.waitFor({ state: "visible", timeout: 5000 });
  const title = await page.locator("#success-modal-title").textContent();

  return {
    success: Boolean(title?.includes("Successful")),
    message: title,
  };
}
