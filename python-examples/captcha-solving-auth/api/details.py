from typing import TypedDict

from intuned_browser import go_to_url
from playwright.async_api import BrowserContext, Page


class Params(TypedDict, total=False):
    name: str
    price: str
    details_url_item: str


class ProductDetails(TypedDict):
    name: str
    price: str
    sku: str
    category: str
    short_description: str
    full_description: str
    image_url: str
    sizes: list[str]
    colors: list[str]


async def automation(
    page: Page,
    params: Params | None = None,
    context: BrowserContext | None = None,
    **_kwargs,
):
    """
    Scrapes product details from a WooCommerce product page.

    Example params:
    {
        "name": "Chaz Kangeroo Hoodie",
        "price": "$52",
        "details_url_item": "https://scrapingcourse.com/ecommerce/product/chaz-kangeroo-hoodie"
    }
    """
    if not params or not params.get("details_url_item"):
        raise ValueError("details_url_item is required in params")

    url = params["details_url_item"]
    print(f"Navigating to: {url}")

    await go_to_url(page, url)

    # Basic info
    name = await page.locator('h1.product_title').text_content()
    price = await page.locator('.price .product-price').first.text_content()
    sku = await page.locator('.sku').text_content()
    category = await page.locator('.posted_in a').text_content()

    # Descriptions
    short_desc = await page.locator('.woocommerce-product-details__short-description p').text_content()
    full_desc_parts = []
    full_desc_locator = page.locator('#tab-description p')
    for i in range(await full_desc_locator.count()):
        text = await full_desc_locator.nth(i).text_content()
        if text:
            full_desc_parts.append(text.strip())
    full_description = '\n'.join(full_desc_parts)

    # Image
    image_url = await page.locator('.woocommerce-product-gallery__image a').first.get_attribute('href')

    # Sizes (skip "Choose an option")
    sizes = []
    size_options = page.locator('#size option')
    for i in range(await size_options.count()):
        value = await size_options.nth(i).get_attribute('value')
        if value:
            sizes.append(value)

    # Colors (skip "Choose an option")
    colors = []
    color_options = page.locator('#color option')
    for i in range(await color_options.count()):
        value = await color_options.nth(i).get_attribute('value')
        if value:
            colors.append(value)

    product: ProductDetails = {
        'name': name.strip() if name else '',
        'price': price.strip() if price else '',
        'sku': sku.strip() if sku else '',
        'category': category.strip() if category else '',
        'short_description': short_desc.strip() if short_desc else '',
        'full_description': full_description,
        'image_url': image_url or '',
        'sizes': sizes,
        'colors': colors,
    }

    print(f"Scraped product: {product['name']}")

    return product
