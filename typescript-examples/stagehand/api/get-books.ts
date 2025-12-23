import z from "zod";
import { Stagehand, AISdkClient } from "@browserbasehq/stagehand";
import { createOpenAI } from "@ai-sdk/openai";
import type { Page, BrowserContext } from "playwright";
import { attemptStore, getAiGatewayConfig } from "@intuned/runtime";


interface Params {
  category?: string;
}

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

type BookDetails = z.infer<typeof bookDetailsSchema>["books"][number];
type BooksResponse = z.infer<typeof bookDetailsSchema>;

const MAX_PAGES = 10;

async function getWebSocketUrl(cdpUrl: string): Promise<string> {
  const versionUrl = cdpUrl.endsWith("/")
    ? `${cdpUrl}json/version`
    : `${cdpUrl}/json/version`;
  const response = await fetch(versionUrl);
  const data = await response.json();
  return data.webSocketDebuggerUrl;
}

export default async function handler(
  { category }: Params,
  page: Page,
  _context: BrowserContext
) {
  // Get AI gateway config for Stagehand
  const { baseUrl, apiKey } = await getAiGatewayConfig();
  const cdpUrl = attemptStore.get("cdpUrl") as string;
  const webSocketUrl = await getWebSocketUrl(cdpUrl);

  // Create AI SDK provider with Intuned's AI gateway
  const openai = createOpenAI({
    apiKey,
    baseURL: baseUrl,
  });

  const llmClient = new AISdkClient({
    model: openai("gpt-5-mini"),
  });

  // Initialize Stagehand with act/extract/observe capabilities
  const stagehand = new Stagehand({
    env: "LOCAL",
    localBrowserLaunchOptions: {
      cdpUrl: webSocketUrl,
      viewport: { width: 1280, height: 800 },
    },
    llmClient,
    logger: console.log,
  });
  await stagehand.init();
  console.log("\nInitialized 🤘 Stagehand");

  await page.setViewportSize({ width: 1280, height: 800 });

  const allBooks: BookDetails[] = [];

  try {
    await page.goto("https://books.toscrape.com");

    // Navigate to category if specified using act
    if (category) {
      // Use observe to find the category link in the sidebar
      const observed = await stagehand.observe(
        `the "${category}" category link in the sidebar`
      );
      console.log(`Observed category link: ${JSON.stringify(observed)}`);

      // Use act to click on the category
      await stagehand.act(
        `Click on the "${category}" category link in the sidebar`
      );
      console.log(`Navigated to ${category} category`);
    }

    // Collect books from all pages
    for (let pageNum = 1; pageNum <= MAX_PAGES; pageNum++) {
      console.log(`Extracting books from page ${pageNum}...`);

      // Extract all book details from the current page
      const result = await stagehand.extract(
        "Extract all books visible on the page with their complete details including title, price, rating, and availability",
         bookDetailsSchema ,
      );
      allBooks.push(...result.books ?? []);
      console.log(
        `Found ${result?.books?.length ?? 0} books on page ${pageNum}, total: ${allBooks.length}`
      );

      // Check if there's a next page and navigate to it
      if (pageNum < MAX_PAGES) {
        try {
          // Use observe to check if next button exists
          const nextButton = await stagehand.observe(
            'the "next" button or link to go to the next page'
          );
          if (!nextButton || nextButton.length === 0) {
            console.log("No more pages available");
            break;
          }

          // Use act to click the next button
          await stagehand.act(
            'Click the "next" button to go to the next page'
          );
          console.log(`Navigated to page ${pageNum + 1}`);
        } catch (e) {
          console.log(`No more pages or navigation failed: ${e}`);
          break;
        }
      }
    }
  } finally {
    // Cleanup Stagehand
    console.log("\nClosing 🤘 Stagehand...");
    await stagehand.close();
  }

  return { books: allBooks } satisfies BooksResponse;
}
