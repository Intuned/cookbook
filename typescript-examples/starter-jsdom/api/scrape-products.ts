import { BrowserContext, Page } from "playwright";
import { goToUrl } from "@intuned/browser";
import { JSDOM } from "jsdom";

interface Params {
  url: string;
}

interface Product {
  title: string;
  price: string;
  detailsUrl: string;
}

export default async function handler(
  params: Params,
  page: Page,
  _context: BrowserContext
) {
  await goToUrl({ page, url: params.url });
  await page.waitForSelector("li.product");

  const html = await page.content();
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const products: Product[] = [];
  document.querySelectorAll("li.product").forEach((el) => {
    const title =
      el
        .querySelector("h2.woocommerce-loop-product__title")
        ?.textContent?.trim() || "";
    const price =
      el.querySelector("span.woocommerce-Price-amount")?.textContent?.trim() ||
      "";
    const detailsUrl =
      el
        .querySelector("a.woocommerce-LoopProduct-link")
        ?.getAttribute("href") || "";
    if (title && detailsUrl) products.push({ title, price, detailsUrl });
  });

  console.log(`Extracted ${products.length} products`);
  return { count: products.length, products };
}
