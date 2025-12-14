from playwright.async_api import Page, BrowserContext
from intuned_browser import go_to_url
from typing import TypedDict, List, Optional


class Params(TypedDict):
    name: str
    price: str
    details_url: str


class Size(TypedDict):
    size: str
    is_available: bool


class ProductDetails(TypedDict, total=False):
    source_url: str
    name: str
    price: str
    sale_price: Optional[str]
    sale_offer: Optional[str]
    sizes: List[Size]
    description: Optional[str]
    shipping_and_returns: Optional[str]


async def extract_price_info(page: Page) -> dict:
    """
    Extracts price information including regular price, sale price, and currency.
    Replace selectors with appropriate ones for your store.
    """
    price = None
    sale_price = None
    sale_offer = None

    # Check for sale price (old price exists)
    # Replace selector with appropriate one for your store
    old_price_element = await page.query_selector("div.prices span.old")

    if old_price_element:
        price = (await old_price_element.inner_text()).strip()
        price = price.replace(",", ".")

        # Get current/sale price - replace selector
        sale_element = await page.query_selector(
            "div.prices span.value"
        ) or await page.query_selector("div.prices span.current")
        sale_price = (await sale_element.inner_text()).strip() if sale_element else None
        sale_price = sale_price.replace(",", ".") if sale_price else None

        # Get sale offer text - replace selector
        sale_offer_element = await page.query_selector("div.prices span.promotion")
        sale_offer = (
            (await sale_offer_element.inner_text()).strip()
            if sale_offer_element
            else None
        )
    else:
        # No sale, regular price only - replace selector
        price_element = await page.query_selector(
            "div.prices span.value"
        ) or await page.query_selector("div.prices span.current")
        price = (await price_element.inner_text()).strip() if price_element else None
        price = price.replace(",", ".") if price else None

    return {
        "price": price,
        "sale_price": sale_price,
        "sale_offer": sale_offer,
    }


async def extract_sizes(page: Page) -> List[Size]:
    """
    Extracts available sizes from the product page.
    Replace selectors with appropriate ones for your store.
    """
    sizes: List[Size] = []

    # Replace selector with appropriate one for your store
    size_container_selector = "div.size-container > ul > li"
    check_sizes_element = await page.query_selector(size_container_selector)

    if check_sizes_element:
        size_elements = await page.query_selector_all(size_container_selector)

        for size_element in size_elements:
            size_text = await size_element.inner_text() if size_element else None
            check_available = await size_element.get_attribute("class")

            # Check if size is available (not sold out)
            is_available = True
            if check_available and "sold-out" in check_available:
                is_available = False

            sizes.append(
                {
                    "size": size_text.strip() if size_text else "",
                    "is_available": is_available,
                }
            )
    else:
        # No size options, single size product
        sizes.append(
            {
                "size": "OneSize",
                "is_available": True,
            }
        )

    return sizes


async def extract_description(page: Page) -> Optional[str]:
    """
    Extracts product description.
    Replace selector with appropriate one for your store.
    """
    # Replace selector with appropriate one for your store
    description_element = await page.query_selector("ul.content-list")
    if description_element:
        return await description_element.inner_text()
    return None


async def extract_shipping_and_returns(page: Page) -> Optional[str]:
    """
    Extracts shipping and returns information.
    Replace selector with appropriate one for your store.
    """
    # Replace selector with appropriate one for your store
    shipping_element = await page.query_selector(
        "#accordion-pdp-content-shipping-return div"
    )
    if shipping_element:
        return await shipping_element.inner_text()
    return None


async def find_entity(page: Page, url: str) -> None:
    await go_to_url(page=page, url=url)
    try:
        await page.wait_for_selector("#onetrust-accept-btn-handler", timeout=5000)
        await page.click("#onetrust-accept-btn-handler")
        print("Accepted cookies")
        await page.wait_for_timeout(1000)
    except Exception:
        pass


async def automation(
    page: Page,
    params: Params | None = None,
    context: BrowserContext | None = None,
    **_kwargs,
):
    """
    Fetches product details from a product page.
    Extracts title, price, sizes, description, and shipping/returns info.

    Example params:
    {
        "name": "Product Name",
        "price": "$99.00",
        "details_url": "https://www.example.com/product/item-1"
    }
    """
    await page.set_viewport_size({"width": 1280, "height": 800})
    if not params or not params.get("details_url"):
        raise ValueError("Params with details_url are required for this automation")

    details_url = params["details_url"]
    print(f"Fetching product details: {details_url}")

    await find_entity(page, details_url)

    # Dismiss any modals - replace with appropriate action for your store
    try:
        await page.keyboard.press("Escape")
    except Exception:
        pass

    # Wait for product title to load - replace selector
    await page.wait_for_selector("h1.product-name")

    # Extract title - replace selector
    title_element = await page.query_selector("h1.product-name")
    title = (
        await title_element.inner_text() if title_element else params.get("name", "")
    )

    # Extract price information
    price_info = await extract_price_info(page)

    # Extract sizes
    sizes = await extract_sizes(page)

    # Extract description
    description = await extract_description(page)

    # Extract shipping and returns
    shipping_and_returns = await extract_shipping_and_returns(page)

    product_details: ProductDetails = {
        "source_url": details_url,
        "name": title.strip() if title else "",
        "price": price_info["price"],
        "sale_price": price_info["sale_price"],
        "sale_offer": price_info["sale_offer"],
        "sizes": sizes,
        "description": description,
        "shipping_and_returns": shipping_and_returns,
    }

    print(f"Extracted details for: {product_details['name']}")
    return product_details
