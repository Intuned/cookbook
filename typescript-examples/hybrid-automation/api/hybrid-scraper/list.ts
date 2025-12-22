import { BrowserContext, Page } from "playwright";
import { goToUrl, clickUntilExhausted } from "@intuned/browser";
import { extendPayload } from "@intuned/runtime";
import { z } from "zod";

const listParamsSchema = z.object({
  category_name: z.string(),
  category_url: z.string().url(),
});

type Params = z.infer<typeof listParamsSchema>;

interface Product {
  name: string;
  price: string;
  details_url: string;
}

async function handleModal(page: Page): Promise<void> {
  try {
    const modalBtn = await page.$(
      "#countrySwitcherModal .btn.btn-primary.dark-theme.full"
    );
    if (modalBtn) {
      await modalBtn.click();
    }
  } catch {
    // Modal not present, continue
  }
}

async function loadAllProducts(page: Page): Promise<void> {
  const loadMoreButton = page.locator("button.more");
  const productContainer = page.locator(".product-grid");

  await clickUntilExhausted({
    page,
    buttonLocator: loadMoreButton,
    containerLocator: productContainer,
    maxClicks: 50,
    clickDelay: 2000,
  });
}

async function extractProducts(
  page: Page,
  categoryUrl: string
): Promise<Product[]> {
  const products: Product[] = [];
  const productLinks = await page.$$(".product-tile__link");

  for (const link of productLinks) {
    const href = await link.getAttribute("href");

    const titleElement = await link.$(".product-tile__name");
    const name = titleElement ? await titleElement.innerText() : "";

    const priceElement = await link.$(".product-tile__price .current");
    const price = priceElement ? await priceElement.innerText() : "";

    if (href) {
      const detailsUrl = new URL(href, categoryUrl).toString();
      products.push({
        name: name.trim(),
        price: price.trim(),
        details_url: detailsUrl,
      });
    }
  }

  return products;
}

async function findEntity(page: Page, url: string): Promise<void> {
  await goToUrl({ page, url });
  try {
    await page.waitForSelector("#onetrust-accept-btn-handler", {
      timeout: 5000,
    });
    await page.click("#onetrust-accept-btn-handler");
    console.log("Accepted cookies");
    await page.waitForTimeout(1000);
  } catch {
    // Cookie banner not present
  }
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  await page.setViewportSize({ width: 1280, height: 800 });

  const { category_name, category_url } = listParamsSchema.parse(params);

  console.log(`Scraping category: ${category_name}`);
  console.log(`Category URL: ${category_url}`);

  // Navigate to the category page
  await findEntity(page, category_url);

  // Handle country/language modal if present
  await handleModal(page);

  // Wait for product grid to load
  await page.waitForSelector(".product-grid");

  // Load all products by clicking "Load More" button
  await loadAllProducts(page);

  // Extract all products from the page
  const allProducts = await extractProducts(page, category_url);

  console.log(`Total products found: ${allProducts.length}`);

  // Enqueue each product for detailed scraping
  for (const product of allProducts) {
    extendPayload({
      api: "hybrid-scraper/details",
      parameters: product,
    });
  }

  return {
    category: category_name,
    products: allProducts,
  };
}
