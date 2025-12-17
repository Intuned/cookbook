import { Page, BrowserContext } from "playwright";
import { goToUrl } from "@intuned/browser";
import { z } from "zod";
import {
  detailsSchema,
  ProductDetails,
  Size,
} from "../utils/typesAndSchemas.js";
type Params = z.infer<typeof detailsSchema>;

/**
 * Extracts price information including regular price, sale price, and currency.
 * Replace selectors with appropriate ones for your store.
 */
async function extractPriceInfo(page: Page): Promise<{
  price: string | null;
  sale_price: string | null;
  sale_offer: string | null;
}> {
  let price: string | null = null;
  let salePrice: string | null = null;
  let saleOffer: string | null = null;

  // Check for sale price (old price exists)
  // Replace selector with appropriate one for your store
  const oldPriceElement = await page.$("div.prices span.old");

  if (oldPriceElement) {
    price = (await oldPriceElement.innerText())?.trim() || null;
    price = price?.replace(",", ".") || null;

    // Get current/sale price - replace selector
    const saleElement =
      (await page.$("div.prices span.value")) ||
      (await page.$("div.prices span.current"));
    salePrice = saleElement
      ? (await saleElement.innerText())?.trim() || null
      : null;
    salePrice = salePrice?.replace(",", ".") || null;

    // Get sale offer text - replace selector
    const saleOfferElement = await page.$("div.prices span.promotion");
    saleOffer = saleOfferElement
      ? (await saleOfferElement.innerText())?.trim() || null
      : null;
  } else {
    // No sale, regular price only - replace selector
    const priceElement =
      (await page.$("div.prices span.value")) ||
      (await page.$("div.prices span.current"));
    price = priceElement
      ? (await priceElement.innerText())?.trim() || null
      : null;
    price = price?.replace(",", ".") || null;
  }

  return {
    price,
    sale_price: salePrice,
    sale_offer: saleOffer,
  };
}

/**
 * Extracts available sizes from the product page.
 * Replace selectors with appropriate ones for your store.
 */
async function extractSizes(page: Page): Promise<Size[]> {
  const sizes: Size[] = [];

  // Replace selector with appropriate one for your store
  const sizeContainerSelector = "div.size-container > ul > li";
  const checkSizesElement = await page.$(sizeContainerSelector);

  if (checkSizesElement) {
    const sizeElements = await page.$$(sizeContainerSelector);

    for (const sizeElement of sizeElements) {
      const sizeText = await sizeElement.innerText();
      const checkAvailable = await sizeElement.getAttribute("class");

      // Check if size is available (not sold out)
      let isAvailable = true;
      if (checkAvailable && checkAvailable.includes("sold-out")) {
        isAvailable = false;
      }

      sizes.push({
        size: sizeText?.trim() || "",
        is_available: isAvailable,
      });
    }
  } else {
    // No size options, single size product
    sizes.push({
      size: "OneSize",
      is_available: true,
    });
  }

  return sizes;
}

/**
 * Extracts product description.
 * Replace selector with appropriate one for your store.
 */
async function extractDescription(page: Page): Promise<string | null> {
  // Replace selector with appropriate one for your store
  const descriptionElement = await page.$("ul.content-list");
  if (descriptionElement) {
    return await descriptionElement.innerText();
  }
  return null;
}

/**
 * Extracts shipping and returns information.
 * Replace selector with appropriate one for your store.
 */
async function extractShippingAndReturns(page: Page): Promise<string | null> {
  // Replace selector with appropriate one for your store
  const shippingElement = await page.$(
    "#accordion-pdp-content-shipping-return div"
  );
  if (shippingElement) {
    return await shippingElement.innerText();
  }
  return null;
}

/**
 * Navigates to URL and handles cookies.
 */
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

/**
 * Fetches product details from a product page.
 * Extracts title, price, sizes, description, and shipping/returns info.
 *
 * Example params:
 * {
 *   "name": "Product Name",
 *   "price": "$99.00",
 *   "details_url": "https://www.example.com/product/item-1"
 * }
 */
async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
): Promise<ProductDetails> {
  await page.setViewportSize({ width: 1280, height: 800 });

  if (!params || !params.details_url) {
    throw new Error("Params with details_url are required for this automation");
  }

  const detailsUrl = params.details_url;
  console.log(`Fetching product details: ${detailsUrl}`);

  await findEntity(page, detailsUrl);

  // Dismiss any modals - replace with appropriate action for your store
  try {
    await page.keyboard.press("Escape");
  } catch {
    // No modal to dismiss
  }

  // Wait for product title to load - replace selector
  await page.waitForSelector("h1.product-name");

  // Extract title - replace selector
  const titleElement = await page.$("h1.product-name");
  const title = titleElement
    ? await titleElement.innerText()
    : params.name || "";

  // Extract price information
  const priceInfo = await extractPriceInfo(page);

  // Extract sizes
  const sizes = await extractSizes(page);

  // Extract description
  const description = await extractDescription(page);

  // Extract shipping and returns
  const shippingAndReturns = await extractShippingAndReturns(page);

  const productDetails: ProductDetails = {
    source_url: detailsUrl,
    name: title?.trim() || "",
    price: priceInfo.price,
    sale_price: priceInfo.sale_price,
    sale_offer: priceInfo.sale_offer,
    sizes,
    description,
    shipping_and_returns: shippingAndReturns,
  };

  console.log(`Extracted details for: ${productDetails.name}`);
  return productDetails;
}

export default handler;
