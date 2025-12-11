import { Page, BrowserContext } from "playwright";
import { goToUrl } from "@intuned/browser";

interface Params {
  name: string;
  vendor: string;
  product_type: string;
  tags: string[];
  details_url: string;
}

interface ProductVariant {
  sku: string;
  title: string;
  price: string;
  compare_at_price: string | null;
  available: boolean;
  inventory_quantity: number;
}

interface ProductDetails {
  source_url: string;
  id: number;
  name: string;
  handle: string;
  vendor: string;
  product_type: string;
  tags: string[];
  description: string;
  price: string;
  images: string[];
  options: any[];
  variants: ProductVariant[];
}

/**
 * Remove HTML tags from a string
 */
function stripHtml(html: string): string {
  if (!html) {
    return "";
  }
  let clean = html.replace(/<[^>]+>/g, "");
  clean = clean.replace(/\s+/g, " ");
  return clean.trim();
}

/**
 * Extracts product details from Shopify JSON response.
 * Uses params from list API for name, vendor, product_type, tags.
 * Fetches additional details (description, images, variants) from JSON.
 */
function extractProductFromJson(data: any, params: Params): ProductDetails {
  const product = data.product || {};

  // Extract image URLs
  const images = (product.images || []).map((img: any) => img.src || "");

  // Extract variants
  const rawVariants = product.variants || [];
  const variants: ProductVariant[] = [];

  if (rawVariants.length > 1) {
    // if there are multiple variants, collect all of them
    for (const variant of rawVariants) {
      variants.push({
        sku: variant.sku || "",
        title: variant.title || "",
        price: variant.price || "",
        compare_at_price: variant.compare_at_price || null,
        available: variant.available ?? (variant.inventory_quantity || 0) > 0,
        inventory_quantity: variant.inventory_quantity || 0,
      });
    }
  }

  // Get price from first variant
  const price = variants.length > 0 ? variants[0].price : "";

  // Filter out options with name "Title" (default/empty options)
  const options = (product.options || []).filter(
    (opt: any) => opt.name !== "Title"
  );

  const result: ProductDetails = {
    source_url: params.details_url,
    id: product.id || 0,
    name: params.name,
    handle: product.handle || "",
    vendor: params.vendor,
    product_type: params.product_type,
    tags: params.tags,
    description: stripHtml(product.body_html || ""),
    price: price,
    images: images,
    options: options,
    variants: variants,
  };

  return result;
}

/**
 * Fetches product details from Shopify JSON API.
 * Appends .json to the details_url to get the JSON endpoint.
 * Works with any Shopify store.
 */
async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
): Promise<ProductDetails> {
  if (!params) {
    throw new Error("Params are required for this automation");
  }

  const detailsUrl = params.details_url;
  await goToUrl(page, detailsUrl);

  // Build JSON endpoint URL
  const jsonUrl = `${detailsUrl}.json`;
  console.log(`Fetching: ${jsonUrl}`);

  const response = await page.request.get(jsonUrl);
  const data = await response.json();

  const productDetails = extractProductFromJson(data, params);

  return productDetails;
}

export default handler;
