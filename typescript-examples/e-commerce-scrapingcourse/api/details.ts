import { BrowserContext, Page } from "playwright";
import { goToUrl, saveFileToS3, type Attachment } from "@intuned/browser";

import {
  ProductDetails,
  ProductVariant,
  DetailsInputSchema,
  detailsSchema,
} from "../utils/typesAndSchemas";

type Params = DetailsInputSchema;

async function getProductImages(page: Page): Promise<Attachment[]> {
  // Extract all product images from the gallery
  const imageElements = await page
    .locator(".woocommerce-product-gallery__image img")
    .all();

  const images: Attachment[] = [];
  for (const imgElement of imageElements) {
    const imgSrc = await imgElement.getAttribute("src");
    if (imgSrc) {
      const uploadedImage = await saveFileToS3({
        trigger: imgSrc,
        page: page,
      });
      images.push(uploadedImage);
    }
  }
  return images;
}

async function getAvailableSizes(page: Page): Promise<string[]> {
  // Extract available sizes from the size dropdown
  const sizeOptions = await page
    .locator("#size option[value]:not([value=''])")
    .all();

  const sizes: string[] = [];
  for (const option of sizeOptions) {
    const sizeValue = await option.getAttribute("value");
    if (sizeValue) {
      sizes.push(sizeValue);
    }
  }
  return sizes;
}

async function getAvailableColors(page: Page): Promise<string[]> {
  // Extract available colors from the color dropdown
  const colorOptions = await page
    .locator("#color option[value]:not([value=''])")
    .all();

  const colors: string[] = [];
  for (const option of colorOptions) {
    const colorValue = await option.getAttribute("value");
    if (colorValue) {
      colors.push(colorValue);
    }
  }
  return colors;
}

async function getProductVariants(page: Page): Promise<ProductVariant[]> {
  // Extract product variants from the JSON data in the form
  // WooCommerce stores all variant information in a data attribute
  const variantsForm = page.locator("form.variations_form");

  // Check if the product has variants
  const hasVariants = await variantsForm.isVisible();
  if (!hasVariants) {
    return [];
  }

  const variantsData = await variantsForm.getAttribute(
    "data-product_variations"
  );

  const variants: ProductVariant[] = [];

  if (!variantsData) {
    return variants;
  }

  try {
    // Parse the JSON data containing all product variants
    const variantsJson = JSON.parse(variantsData);

    for (const variant of variantsJson) {
      // Extract availability text and parse stock number
      const availabilityHtml = variant.availability_html || "";
      const stockMatch = availabilityHtml.match(/(\d+)\s+in stock/);
      const stock = stockMatch ? parseInt(stockMatch[1]) : 0;

      variants.push({
        sku: variant.sku || "",
        size: variant.attributes?.attribute_size || "",
        color: variant.attributes?.attribute_color || "",
        availability: variant.is_in_stock ? "In Stock" : "Out of Stock",
        stock: stock,
      });
    }
  } catch (error) {
    console.error("Failed to parse variants data:", error);
  }

  return variants;
}

export async function extractProductDetails(
  page: Page,
  params: Params
): Promise<ProductDetails> {
  // Wait for the main product container to load
  const productContainer = page.locator("div[id^='product']");
  await productContainer.waitFor({ state: "visible" });

  // Extract the product title
  const titleElement = page.locator("h1.product_title");
  const name = (await titleElement.textContent()) || params.name;

  // Extract the price
  const priceElement = page
    .locator(".summary .price .woocommerce-Price-amount")
    .first();
  const price = await priceElement.textContent();

  // Extract ID
  const idElemnent = page.locator(".sku_wrapper .sku");
  const id = (await idElemnent.textContent()) || "";

  // Extract category
  const categoryElement = page.locator(".posted_in a");
  const category = (await categoryElement.textContent()) || "";

  // Extract short description (the brief summary under the title)
  const shortDescElement = page.locator(
    ".woocommerce-product-details__short-description"
  );
  const shortDescription = (await shortDescElement.textContent()) || "";

  // Extract full description from the Description tab
  const fullDescElement = page.locator("#tab-description p");
  const fullDescriptionParts = await fullDescElement.allTextContents();
  const fullDescription = fullDescriptionParts.join("\n").trim();

  // Extract images, sizes, colors, and variants
  const imageAttachments = await getProductImages(page);
  const availableSizes = await getAvailableSizes(page);
  const availableColors = await getAvailableColors(page);
  const variants = await getProductVariants(page);

  return {
    //data from params
    detailsUrl: params.detailsUrl,
    // New detailed information
    name: name.trim(),
    price: price?.trim() || "",
    id: id.trim(),
    category: category.trim(),
    shortDescription: shortDescription.trim(),
    fullDescription: fullDescription,
    imageAttachments,
    availableSizes,
    availableColors,
    variants,
  };
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
): Promise<ProductDetails> {
  // Validate params using Zod schema
  const validatedParams = detailsSchema.parse(params);

  // Navigate to the product detail page using the URL from params
  await goToUrl({
    page: page,
    url: validatedParams.detailsUrl,
  });

  // Extract all detailed product information
  const productDetails = await extractProductDetails(page, validatedParams);

  // Return the complete product details
  return productDetails;
}
