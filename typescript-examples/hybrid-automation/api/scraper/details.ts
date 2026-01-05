import { BrowserContext, Page } from "playwright";
import { goToUrl } from "@intuned/browser";
import { extractStructuredData } from "@intuned/browser/ai";
import { z } from "zod";
import { JsonSchema } from "@intuned/browser/ai";

const detailsParamsSchema = z.object({
  name: z.string(),
  price: z.string(),
  details_url: z.string().url(),
});

type Params = z.infer<typeof detailsParamsSchema>;

interface Size {
  size: string;
  is_available: boolean;
}

interface ShippingOption {
  name: string;
  delivery_time: string;
}

interface ShippingDetails {
  free_shipping_threshold?: string;
  return_days?: number;
  shipping_options: ShippingOption[];
  delivery_days?: string;
  return_window_days?: number;
  taxes_note?: string;
}

interface ProductDetails {
  source_url: string;
  name: string;
  price: string;
  sale_price?: string;
  sale_offer?: string;
  sizes: Size[];
  description?: string;
  shipping_details?: ShippingDetails;
}

async function extractPriceInfo(page: Page): Promise<{
  price?: string;
  sale_price?: string;
  sale_offer?: string;
}> {
  let price: string | undefined;
  let salePrice: string | undefined;
  let saleOffer: string | undefined;

  const oldPriceElement = await page.$("div.prices span.old");

  if (oldPriceElement) {
    price = (await oldPriceElement.innerText()).trim().replace(",", ".");

    const saleElement =
      (await page.$("div.prices span.value")) ||
      (await page.$("div.prices span.current"));
    if (saleElement) {
      salePrice = (await saleElement.innerText()).trim().replace(",", ".");
    }

    const saleOfferElement = await page.$("div.prices span.promotion");
    if (saleOfferElement) {
      saleOffer = (await saleOfferElement.innerText()).trim();
    }
  } else {
    const priceElement =
      (await page.$("div.prices span.value")) ||
      (await page.$("div.prices span.current"));
    if (priceElement) {
      price = (await priceElement.innerText()).trim().replace(",", ".");
    }
  }

  return { price, sale_price: salePrice, sale_offer: saleOffer };
}

async function extractSizes(page: Page): Promise<Size[]> {
  const sizes: Size[] = [];
  const sizeContainerSelector = "div.size-container > ul > li";
  const checkSizesElement = await page.$(sizeContainerSelector);

  if (checkSizesElement) {
    const sizeElements = await page.$$(sizeContainerSelector);

    for (const sizeElement of sizeElements) {
      const sizeText = await sizeElement.innerText();
      const checkAvailable = await sizeElement.getAttribute("class");
      const isAvailable = !(checkAvailable && checkAvailable.includes("sold-out"));

      sizes.push({
        size: sizeText?.trim() || "",
        is_available: isAvailable,
      });
    }
  } else {
    sizes.push({ size: "OneSize", is_available: true });
  }

  return sizes;
}

async function extractDescription(page: Page): Promise<string | undefined> {
  const descriptionElement = await page.$("ul.content-list");
  if (descriptionElement) {
    return await descriptionElement.innerText();
  }
  return undefined;
}

async function extractShippingAndReturns(
  page: Page
): Promise<ShippingDetails | undefined> {
  const shippingSchema: JsonSchema = {
    type: "object",
    properties: {
      free_shipping_threshold: {
        type: "string",
        description: "Minimum order amount for free shipping (e.g., '$95')",
      },
      return_days: {
        type: "number",
        description: "Number of days for returns and exchanges",
      },
      shipping_options: {
        type: "array",
        description: "Available shipping options with delivery times",
        items: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Shipping carrier and service name",
            },
            delivery_time: {
              type: "string",
              description: "Estimated delivery time",
            },
          },
          required: ["name", "delivery_time"],
        },
      },
      delivery_days: {
        type: "string",
        description: "Days of the week when delivery is available",
      },
      return_window_days: {
        type: "number",
        description: "Number of days from delivery date to return purchase",
      },
      taxes_note: {
        type: "string",
        description: "Note about taxes and additional fees",
      },
    },
  };

  try {
    const result = await extractStructuredData({
      source: page,
      dataSchema: shippingSchema,
      model: "gpt-5-mini",
      prompt:
"Extract shipping and returns information from this page including free shipping threshold, return policy days, shipping options with delivery times, and any notes about taxes.",
    });
    if (result) {
      return result as ShippingDetails;
    }
  } catch (e) {
    console.log(`Failed to extract shipping details: ${e}`);
  }

  return undefined;
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
): Promise<ProductDetails> {
  await page.setViewportSize({ width: 1280, height: 800 });

  const { name: paramName, details_url } = detailsParamsSchema.parse(params);

  console.log(`Fetching product details: ${details_url}`);

  await findEntity(page, details_url);

  // Dismiss any modals
  try {
    await page.keyboard.press("Escape");
  } catch {
    // No modal to dismiss
  }

  // Wait for product title to load
  await page.waitForSelector("h1.product-name");

  // Extract title
  const titleElement = await page.$("h1.product-name");
  const title = titleElement ? await titleElement.innerText() : paramName;

  // Extract price information
  const priceInfo = await extractPriceInfo(page);

  // Extract sizes
  const sizes = await extractSizes(page);

  // Extract description
  const description = await extractDescription(page);

  // Extract shipping and returns as structured data
  const shippingDetails = await extractShippingAndReturns(page);

  const productDetails: ProductDetails = {
    source_url: details_url,
    name: title?.trim() || "",
    price: priceInfo.price || "",
    sale_price: priceInfo.sale_price,
    sale_offer: priceInfo.sale_offer,
    sizes,
    description,
    shipping_details: shippingDetails,
  };

  console.log(`Extracted details for: ${productDetails.name}`);
  return productDetails;
}
