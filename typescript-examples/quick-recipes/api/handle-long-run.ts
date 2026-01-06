import { extendTimeout } from "@intuned/runtime";
import { BrowserContext, Page } from "playwright";

interface Book {
  title: string;
  price: string;
  url: string;
}

export default async function handler(
  params: { maxPages?: number },
  page: Page,
  context: BrowserContext
) {
  const allBooks: Book[] = [];
  const maxPages = params.maxPages || 50;
  let currentPage = 1;

  await page.goto("https://books.toscrape.com/");

  while (currentPage <= maxPages) {
    console.log(`Processing page ${currentPage} of ${maxPages}...`);

    // Extract books from current page
    const bookElements = page.locator("article.product_pod");
    const count = await bookElements.count();

    for (let i = 0; i < count; i++) {
      const book = bookElements.nth(i);
      const title = await book.locator("h3 a").getAttribute("title");
      const price = await book.locator(".price_color").textContent();
      const bookUrl = await book.locator("h3 a").getAttribute("href");

      if (title && price && bookUrl) {
        allBooks.push({
          title,
          price: price.trim(),
          url: `https://books.toscrape.com/${bookUrl}`,
        });
      }
    }

    console.log(`Completed page ${currentPage}. Books collected: ${allBooks.length}`);

    // Extend timeout after completing this unit of work
    extendTimeout();

    // Check if there's a next page
    const nextButton = page.locator(".next a");
    const hasNext = (await nextButton.count()) > 0;

    if (!hasNext || currentPage >= maxPages) {
      break;
    }

    // Add delay between page requests to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Navigate to next page
    await nextButton.click();
    await page.waitForLoadState("networkidle");

    currentPage++;
  }

  console.log(`Total books collected: ${allBooks.length}`);
  return allBooks;
}