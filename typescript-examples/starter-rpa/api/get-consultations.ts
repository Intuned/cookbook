import { BrowserContext, Page } from "playwright";
import { goToUrl } from "@intuned/browser";

interface Consultation {
  id: string;
  status: string;
  clientName: string;
  email: string;
  date: string;
  time: string;
}

export default async function handler(
  _params: Record<string, never>,
  page: Page,
  _context: BrowserContext
): Promise<Consultation[]> {
  await goToUrl({
    page,
    url: "https://sandbox.intuned.dev/consultations/list",
  });

  await page.locator("#consultations-list").waitFor({ state: "visible" });

  const items = await page.locator(".consultation-item").all();
  const consultations: Consultation[] = [];

  for (const item of items) {
    const id = (await item.locator(".consultation-id").textContent()) ?? "";
    const status =
      (await item.locator(".consultation-status").textContent()) ?? "";
    const clientName =
      (await item.locator(".client-name .data-value").textContent()) ?? "";
    const email =
      (await item.locator(".client-email .data-value").textContent()) ?? "";
    const date =
      (await item.locator(".consultation-date .data-value").textContent()) ??
      "";
    const time =
      (await item.locator(".consultation-time .data-value").textContent()) ??
      "";

    consultations.push({
      id: id.trim(),
      status: status.trim(),
      clientName: clientName.trim(),
      email: email.trim(),
      date: date.trim(),
      time: time.trim(),
    });
  }

  console.log(`Extracted ${consultations.length} consultations`);
  return consultations;
}
