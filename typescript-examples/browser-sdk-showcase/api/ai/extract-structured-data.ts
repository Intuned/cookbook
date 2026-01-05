// https://docs.intunedhq.com/automation-sdks/intuned-sdk/typescript/ai/functions/extractStructuredData
import { BrowserContext, Page } from "playwright";
import { goToUrl } from "@intuned/browser";
import { extractStructuredData } from "@intuned/browser/ai";
import { z } from "zod";

interface Params {
  // No params needed
}

const BookSchema = z.object({
  name: z.string().describe("Book title"),
  price: z.string().describe("Book price"),
  description: z.string().nullable().describe("Book description"),
  in_stock: z.boolean().describe("Stock availability"),
  rating: z.string().nullable().describe("Book rating"),
});

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  await goToUrl({
    page,
    url: "https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html",
  });

  // Extract from the Page directly using Zod schema.
  // You can also extract from a specific locator or by passing TextContentItem.
  const product = await extractStructuredData({
    source: page,
    strategy: "HTML",
    model: "gpt-5-mini",
    dataSchema: BookSchema, // Pass Zod schema directly, or use a normal JSON schema object too.
    prompt: "Extract book details from this page",
    enableCache: false, // To enable cache, you must run in Intuned context (IDE/CLI) and save the project, with the correct API credentials.
    maxRetries: 3,
  });

  console.log(`Found product: ${product.name} - ${product.price}`);

  return {
    name: product.name,
    price: product.price,
    description: product.description,
    in_stock: product.in_stock,
    rating: product.rating,
  };
}

