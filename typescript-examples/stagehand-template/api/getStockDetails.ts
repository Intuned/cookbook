import z from "zod";
import type { Page, Stagehand } from "@browserbasehq/stagehand";
import { attemptStore } from "@intuned/runtime";

interface Params {
  criteria: string;
}
type BrowserContext = Stagehand["context"];
export default async function handler(
  { criteria }: Params,
  page: Page,
  _: BrowserContext
) {
  const stagehand: Stagehand = attemptStore.get("stagehand");

  await page.goto("https://www.nasdaq.com/market-activity/stocks");

  const agent = stagehand.agent({});

  // Agent runs on current Stagehand page
  await agent.execute({
    instruction: `Find and open the page on one stock based on the following criteria: ${criteria}.`,
  });

  const stockDetailsSchema = z.object({
    stock: z
      .object({
        name: z.string(),
        symbol: z.string(),
        industry: z.string(),
        shareVolume: z.number().optional(),
        averageVolume: z.number().optional(),
        marketCap: z.number(),
      })
      .nullable(),
  });

  // Extract stock details from the page using Stagehand
  return await stagehand.extract(
    "Extract the stock details. If the current page is not a stock page, return null",
    stockDetailsSchema,
    {
      page: page,
    }
  );
}
