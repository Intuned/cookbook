import z from "zod";
import type { Stagehand } from "@browserbasehq/stagehand";
import type { Page, BrowserContext } from "playwright";
import { attemptStore } from "@intuned/runtime";
import { goToUrl } from "@intuned/browser";

interface Params {
  category?: string;
}
export default async function handler(
  { category }: Params,
  page: Page,  // Playwright page
  _: BrowserContext
) {
  const stagehand: Stagehand = attemptStore.get("stagehand");

  await goToUrl({
    page,
    url: "https://books.toscrape.com",
  });
  const agent = stagehand.agent({
    cua: true, // CUA agent. This will use X Y Coordinates to click and control the page. Each model may behave differently with CUA.
    model: "google/gemini-2.5-computer-use-preview-10-2025",
    systemPrompt: "You're a helpful assistant that can control a web browser. Do Not ask for confirmation before any interraction",
  });

  // Agent runs on current Stagehand page
  if (category) {
    await agent.execute({
      instruction: `Navigate to the "${category}" category by clicking on it in the sidebar`,
      page: page,
    });
  }

  // Define a schema for book details
  const bookDetailsSchema = z.object({
    books: z.array(
      z.object({
        title: z.string(),
        price: z.string(),
        rating: z.string().optional(),
        availability: z.string().optional(),
      })
    ),
  });

  // Extract all book details from the page using Stagehand
  const books = await stagehand.extract(
    "Extract all books visible on the page with their complete details including title, price, rating, and availability",
    bookDetailsSchema,
    {
      page: page,
    }
  );
  return books;
}
