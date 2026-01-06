import { BrowserContext, Page } from "playwright";
import { extractStructuredData } from "@intuned/browser/ai";
import { z } from "zod";

// Define the schema for a single product
const ProductSchema = z.object({
  name: z.string().describe("Product name"),
  price: z.string().describe("Product price"),
  stock: z.string().describe("Stock status"),
  category: z.string().describe("Product category"),
});

// Define the schema for the list of products
const ProductsSchema = z.object({
  products: z.array(ProductSchema).describe("List of products from the table"),
});

export default async function handler(
  params: any,
  page: Page,
  context: BrowserContext
) {
  await page.goto("https://www.scrapingcourse.com/table-parsing");

  // Extract products using AI - no selectors needed
  const result = await extractStructuredData({
    source: page,
    dataSchema: ProductsSchema,
    prompt: "Extract all products from the table",
  });

  console.log(`Extracted ${result.products.length} products`);
  return result.products;
}