from playwright.async_api import Page
from typing import List, Optional
from intuned_browser import go_to_url, save_file_to_s3, Attachment
import json
import re

from utils.types_and_schemas import (
    ProductDetails,
    ProductVariant,
    DetailsSchema,
)


async def get_product_images(page: Page) -> List[Attachment]:
    # Extract all product images from the gallery
    image_elements = await page.locator(".woocommerce-product-gallery__image img").all()

    images: List[Attachment] = []
    for img_element in image_elements:
        img_src = await img_element.get_attribute("src")
        if img_src:
            uploaded_image = await save_file_to_s3(
                trigger=img_src,
                page=page,
            )
            images.append(uploaded_image)
    return images


async def get_available_sizes(page: Page) -> List[str]:
    # Extract available sizes from the size dropdown
    size_options = await page.locator("#size option[value]:not([value=''])").all()

    sizes: List[str] = []
    for option in size_options:
        size_value = await option.get_attribute("value")
        if size_value:
            sizes.append(size_value)
    return sizes


async def get_available_colors(page: Page) -> List[str]:
    # Extract available colors from the color dropdown
    color_options = await page.locator("#color option[value]:not([value=''])").all()

    colors: List[str] = []
    for option in color_options:
        color_value = await option.get_attribute("value")
        if color_value:
            colors.append(color_value)
    return colors


async def get_product_variants(page: Page) -> List[ProductVariant]:
    # Extract product variants from the JSON data in the form
    # WooCommerce stores all variant information in a data attribute
    variants_form = page.locator("form.variations_form")

    # Check if the product has variants
    has_variants = await variants_form.is_visible()
    if not has_variants:
        return []

    variants_data = await variants_form.get_attribute("data-product_variations")

    variants: List[ProductVariant] = []

    if not variants_data:
        return variants

    try:
        # Parse the JSON data containing all product variants
        variants_json = json.loads(variants_data)

        for variant in variants_json:
            # Extract availability text and parse stock number
            availability_html = variant.get("availability_html", "")
            stock_match = re.search(r"(\d+)\s+in stock", availability_html)
            stock = int(stock_match.group(1)) if stock_match else 0

            variants.append(
                ProductVariant(
                    sku=variant.get("sku", ""),
                    size=variant.get("attributes", {}).get("attribute_size", ""),
                    color=variant.get("attributes", {}).get("attribute_color", ""),
                    availability="In Stock"
                    if variant.get("is_in_stock")
                    else "Out of Stock",
                    stock=stock,
                )
            )
    except Exception as error:
        print(f"Failed to parse variants data: {error}")

    return variants


async def extract_product_details(page: Page, params: DetailsSchema) -> ProductDetails:
    # Wait for the main product container to load
    product_container = page.locator("div[id^='product']")
    await product_container.wait_for(state="visible")

    # Extract the product title
    title_element = page.locator("h1.product_title")
    name = await title_element.text_content() or params.name

    # Extract the price
    price_element = page.locator(".summary .price .woocommerce-Price-amount").first
    price = await price_element.text_content()

    # Extract id (Stock Keeping Unit)
    id_element = page.locator(".sku_wrapper .sku")
    id = await id_element.text_content() or ""

    # Extract category
    category_element = page.locator(".posted_in a")
    category = await category_element.text_content() or ""

    # Extract short description (the brief summary under the title)
    short_desc_element = page.locator(".woocommerce-product-details__short-description")
    short_description = await short_desc_element.text_content() or ""

    # Extract full description from the Description tab
    full_desc_element = page.locator("#tab-description p")
    full_description_parts = await full_desc_element.all_text_contents()
    full_description = "\n".join(full_description_parts).strip()

    # Extract images, sizes, colors, and variants
    image_attachments = await get_product_images(page)
    available_sizes = await get_available_sizes(page)
    available_colors = await get_available_colors(page)
    variants = await get_product_variants(page)

    return ProductDetails(
        # data from params
        detailsUrl=str(params.detailsUrl),
        # New detailed information
        name=name.strip(),
        price=price.strip() if price else "",
        id=id.strip(),
        category=category.strip(),
        shortDescription=short_description.strip(),
        fullDescription=full_description,
        imageAttachments=image_attachments,
        availableSizes=available_sizes,
        availableColors=available_colors,
        variants=variants,
    )


async def handler(
    page: Page,
    params: Optional[dict] = None,
    **_kwargs,
) -> ProductDetails:
    if params is None:
        raise ValueError("Params are required for this handler")

    # Validate params using pydantic model
    validated_params = DetailsSchema(**params)

    # Navigate to the product detail page using the URL from params
    await go_to_url(
        page=page,
        url=str(validated_params.detailsUrl),
    )

    # Extract all detailed product information
    product_details = await extract_product_details(page, validated_params)

    # Return the complete product details
    return product_details
