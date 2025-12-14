from playwright.async_api import Page, BrowserContext
from typing import TypedDict, List
from bs4 import BeautifulSoup
from intuned_browser import go_to_url


class Params(TypedDict):
    title: str
    price: str
    details_url: str


class ProductDetails(TypedDict):
    title: str
    price: str
    source_url: str
    description: str
    sku: str
    category: str
    sizes: List[str]
    colors: List[str]
    images: List[str]


def extract_product_details(html: str, params: Params) -> ProductDetails:
    """
    Extracts detailed product information from the page HTML using BeautifulSoup.
    Replace selectors with appropriate ones for your target site.
    """
    soup = BeautifulSoup(html, "html.parser")

    # Extract description - replace selector as needed
    description_element = soup.select_one("#tab-description p")
    description = (
        description_element.get_text(strip=True) if description_element else ""
    )

    # Extract SKU - replace selector as needed
    sku_element = soup.select_one(".sku")
    sku = sku_element.get_text(strip=True) if sku_element else ""

    # Extract category - replace selector as needed
    category_element = soup.select_one(".posted_in a")
    category = category_element.get_text(strip=True) if category_element else ""

    # Extract sizes from select options - replace selector as needed
    size_options = soup.select("#size option")
    sizes = [
        opt.get_text(strip=True)
        for opt in size_options
        if opt.get("value") and opt.get("value") != ""
    ]

    # Extract colors from select options - replace selector as needed
    color_options = soup.select("#color option")
    colors = [
        opt.get_text(strip=True)
        for opt in color_options
        if opt.get("value") and opt.get("value") != ""
    ]

    # Extract product images - replace selector as needed
    image_elements = soup.select(".woocommerce-product-gallery__image img")
    images = [img.get("src", "") for img in image_elements if img.get("src")]

    return {
        "title": params["title"],
        "price": params["price"],
        "source_url": params["details_url"],
        "description": description,
        "sku": sku,
        "category": category,
        "sizes": sizes,
        "colors": colors,
        "images": images,
    }


async def automation(
    page: Page,
    params: Params,
    context: BrowserContext | None = None,
    **_kwargs,
):
    """
    Scrapes product details from a product page using BeautifulSoup.
    This API is called via extend_payload from the list API.

    Expected params (from list.py extend_payload):
    {
        "title": "Product Name",
        "price": "$19.99",
        "details_url": "https://www.scrapingcourse.com/ecommerce/product/example"
    }

    This function:
    1. Navigates to the product details page
    2. Extracts additional product information using BeautifulSoup
    3. Returns complete product details
    """
    # Validate required params
    if not params.get("details_url"):
        raise ValueError("details_url is required in params")

    details_url = params["details_url"]
    print(f"Scraping product details from: {details_url}")

    # Navigate to the product page
    await go_to_url(page, details_url)

    # Wait for the product content to load - replace selector as needed
    await page.wait_for_selector(".product")

    # Get the page HTML
    html = await page.content()

    # Extract product details using BeautifulSoup
    product_details = extract_product_details(html, params)

    print(f"Successfully scraped details for: {product_details['title']}")
    return product_details
