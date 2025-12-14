from playwright.async_api import Page, BrowserContext
from typing import TypedDict, List
from bs4 import BeautifulSoup
from intuned_browser import go_to_url
from runtime_helpers import extend_payload


class Params(TypedDict):
    url: str  # The URL to scrape (e.g.: https://www.scrapingcourse.com/ecommerce/)
    max_pages: int | None  # Maximum number of pages to scrape (default: 10)


class Product(TypedDict):
    title: str
    price: str
    details_url: str


def extract_products(html: str) -> List[Product]:
    """
    Extracts product info from the page HTML using BeautifulSoup.
    Replace selectors with appropriate ones for your target site.
    """
    soup = BeautifulSoup(html, "html.parser")
    products: List[Product] = []

    # Find all product items - replace selector as needed
    product_elements = soup.select("li.product")

    for product in product_elements:
        # Extract title - replace selector as needed
        title_element = product.select_one("h2.woocommerce-loop-product__title")
        title = title_element.get_text(strip=True) if title_element else ""

        # Extract price - replace selector as needed
        price_element = product.select_one("span.woocommerce-Price-amount")
        price = price_element.get_text(strip=True) if price_element else ""

        # Extract details URL - replace selector as needed
        link_element = product.select_one("a.woocommerce-LoopProduct-link")
        details_url = link_element.get("href", "") if link_element else ""

        if title and details_url:
            products.append(
                {
                    "title": title,
                    "price": price,
                    "details_url": details_url,
                }
            )

    return products


def get_next_page_url(html: str) -> str | None:
    """
    Extracts the next page URL from pagination.
    Returns None if there is no next page.
    """
    soup = BeautifulSoup(html, "html.parser")

    # Find the next page link - replace selector as needed
    next_link = soup.select_one("a.next.page-numbers")

    if next_link:
        return next_link.get("href")

    return None


async def automation(
    page: Page,
    params: Params,
    context: BrowserContext | None = None,
    **_kwargs,
):
    """
    Scrapes product listings from an e-commerce site using BeautifulSoup.
    Handles pagination by following "Next" page links.

    Example params:
    {
        "url": "https://www.scrapingcourse.com/ecommerce/",
        "max_pages": 5
    }

    This function:
    1. Navigates to the listing page
    2. Extracts product data using BeautifulSoup
    3. Follows pagination links to scrape multiple pages
    4. Returns all products found
    """
    # Set default values
    url = params["url"]
    if not url:
        raise ValueError("url is required in params")
    max_pages = params["max_pages"] or 10

    print(f"Starting scrape from: {url}")
    print(f"Max pages: {max_pages}")

    all_products: List[Product] = []
    current_url: str | None = url
    current_page = 1

    while current_url and current_page <= max_pages:
        print(f"Scraping page {current_page}: {current_url}")

        # Navigate to the page
        await go_to_url(page, current_url)

        # Wait for products to load - replace selector as needed
        await page.wait_for_selector("li.product")

        # Get the page HTML
        html = await page.content()

        # Extract products using BeautifulSoup
        products = extract_products(html)
        all_products.extend(products)

        print(f"Found {len(products)} products on page {current_page}")

        # Get next page URL
        current_url = get_next_page_url(html)
        current_page += 1

    print(f"Total products scraped: {len(all_products)}")
    for product in all_products:
        extend_payload(
            {
                "api": "details",
                "parameters": product,
            }
        )
    return {
        "products": all_products,
        "count": len(all_products),
        "pages_scraped": current_page - 1,
    }
