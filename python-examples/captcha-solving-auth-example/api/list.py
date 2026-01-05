from playwright.async_api import Page, BrowserContext
from intuned_browser import go_to_url
from typing import TypedDict, List
from intuned_runtime import extend_payload


class Params(TypedDict):
    pass

class Product(TypedDict):
    name: str
    price: str
    details_url_item: str


async def automation(
    page: Page,
    params: Params | None = None,
    context: BrowserContext | None = None,
    **_kwargs,
):
    """
    Scrapes products from a product grid page.
    Extracts name, price, and detail URL for each product.

    Example params:
    {
        "url": "https://scrapingcourse.com/dashboard"
    }
    """

    await go_to_url(page, "https://scrapingcourse.com/dashboard")
    products: List[Product] = []
    items = page.locator('.product-item')
    count = await items.count()

    for i in range(count):
        item = items.nth(i)
        name = await item.locator('.product-name').text_content()
        price = await item.locator('.product-price').text_content()
        details_url = await item.locator('a').get_attribute('href')

        products.append({
            'name': name.strip() if name else '',
            'price': price.strip() if price else '',
            'details_url_item': details_url or '',
        })

    print(f"Total products scraped: {len(products)}")

    for product in products:
        extend_payload({
            "api": "product-details",
            "parameters": dict(product),
        })

    return {"products": products}