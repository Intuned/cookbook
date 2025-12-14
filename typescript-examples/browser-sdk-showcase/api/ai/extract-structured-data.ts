import { BrowserContext, Page } from "playwright";
import { goToUrl } from "@intuned/browser";
import { extractStructuredData, TextContentItem } from "@intuned/browser/ai";
import { z } from "zod";

interface Params {
  extractFromContent?: boolean;
  extractFromPage?: boolean;
  extractList?: boolean;
}

// Define schema using Zod

const PersonSchema = z.object({
  name: z.string().describe("Person's full name"),
  age: z.number().describe("Person's age"),
  occupation: z.string().describe("Person's job title"),
  company: z.string().describe("Company name"),
});

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  // Extract from Text or Image content - Using Zod schema
  const extractFromContent = params.extractFromContent || false;
  if (extractFromContent) {
    const textContent: TextContentItem = {
      type: "text",
      data: "John Doe, age 30, works as a Software Engineer at Tech Corp",
    };

    const person = await extractStructuredData({
      content: textContent,
      model: "claude-3-7-sonnet-latest",
      dataSchema: PersonSchema, // Pass Zod schema directly
      prompt: "Extract person information from the text",
      enableCache: false, // To enable cache, you must run in Intuned context (IDE/CLI) and save the project, with the correct API credentials.
    });

    console.log(`Found person: ${person.name}, ${person.age} years old`);
  }

  // Extract from the Page directly - Using Zod schema
  const extractFromPage = params.extractFromPage || false;
  if (extractFromPage) {
    const BookSchema = z.object({
      name: z.string().describe("Book title"),
      price: z.string().describe("Book price"),
      description: z.string().nullable().describe("Book description"),
      in_stock: z.boolean().describe("Stock availability"),
      rating: z.string().nullable().describe("Book rating"),
    });

    await goToUrl({
      page,
      url: "https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html",
    });

    const product = await extractStructuredData({
      source: page,
      strategy: "HTML",
      model: "gpt-4o",
      dataSchema: BookSchema, // Pass Zod schema directly
      prompt: "Extract book details from this page",
      enableCache: false, // To enable cache, you must run in Intuned context (IDE/CLI) and save the project, with the correct API credentials.
      maxRetries: 3,
    });

    console.log(`Found product: ${product.name} - ${product.price}`);
  }

  // Extract the list using JSON schema (not Zod)
  const extractList = params.extractList || false;
  if (extractList) {
    await goToUrl({ page, url: "https://books.toscrape.com" });

    const books = await extractStructuredData({
      source: page,
      strategy: "HTML",
      model: "gpt-4o",
      dataSchema: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            price: { type: "number" },
            description: { type: "string" },
            in_stock: { type: "boolean" },
            rating: { type: "number" },
            reviews_count: { type: "integer" },
          },
          required: ["name", "price"],
        },
      },
      prompt: "Extract book details from this page",
      enableCache: false, // To enable cache, you must run in Intuned context (IDE/CLI) and save the project, with the correct API credentials.
      maxRetries: 3,
    });

    console.log(`Found ${books.length} books`);
    books.forEach((book: any) => {
      console.log(`Book: ${book.name} - ${book.price}`);
    });
    return books;
  }

  return "Success";
}

