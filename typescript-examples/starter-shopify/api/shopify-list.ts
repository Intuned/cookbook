import { Page, BrowserContext } from "playwright";
import { goToUrl } from "@intuned/browser";

interface Params {
  store_url: string;
  maxPages?: number;
}

interface Product {
  name: string;
  vendor: string;
  product_type: string;
  tags: string[];
  details_url: string;
}

const LIMIT = 250;

export default async function handler(
  params: Params,
  page: Page,
  _context: BrowserContext
): Promise<{ products: Product[] }> {
  const storeUrl = params.store_url.replace(/\/$/, "");
  new URL(storeUrl);

  const baseUrl = `${storeUrl}/products.json`;
  const productBaseUrl = `${storeUrl}/products/`;
  const maxPages = params.maxPages ?? 3;

  await goToUrl({ page, url: storeUrl });

  const allProducts: Product[] = [];
  for (let currentPage = 1; currentPage <= maxPages; currentPage++) {
    const url = `${baseUrl}?limit=${LIMIT}&page=${currentPage}`;
    const response = await page.request.get(url);
    const data = await response.json();

    const products: Product[] = (data.products || []).map((p: any) => ({
      name: p.title || "",
      vendor: p.vendor || "",
      product_type: p.product_type || "",
      tags: p.tags || [],
      details_url: `${productBaseUrl}${p.handle || ""}`,
    }));

    if (products.length === 0) break;
    allProducts.push(...products);
    console.log(`Page ${currentPage}: +${products.length} products (total ${allProducts.length})`);
  }

  return { products: allProducts };
}
