from intuned_browser import go_to_url
from playwright.async_api import BrowserContext, Page
from utils.types_and_schemas import EcommereceDetailsParams, ProductDetails, Size


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
    old_price_locator = page.locator("div.prices span.old")

    if await old_price_locator.count() > 0:
        price = (await old_price_locator.first.inner_text()).strip()
        price = price.replace(",", ".")

        # Get current/sale price - replace selector
        sale_locator = page.locator("div.prices span.value, div.prices span.current")
        sale_price = (await sale_locator.first.inner_text()).strip() if await sale_locator.count() > 0 else None
        sale_price = sale_price.replace(",", ".") if sale_price else None

        # Get sale offer text - replace selector
        sale_offer_locator = page.locator("div.prices span.promotion")
        sale_offer = (
            (await sale_offer_locator.first.inner_text()).strip()
            if await sale_offer_locator.count() > 0
            else None
        )
    else:
        # No sale, regular price only - replace selector
        price_locator = page.locator("div.prices span.value, div.prices span.current")
        price = (await price_locator.first.inner_text()).strip() if await price_locator.count() > 0 else None
        price = price.replace(",", ".") if price else None

    return {
        "price": price,
        "sale_price": sale_price,
        "sale_offer": sale_offer,
    }


async def extract_sizes(page: Page) -> list[Size]:
    """
    Extracts available sizes from the product page.
    Replace selectors with appropriate ones for your store.
    """
    sizes: list[Size] = []

    # Replace selector with appropriate one for your store
    size_container_selector = "div.size-container > ul > li"
    size_locator = page.locator(size_container_selector)

    if await size_locator.count() > 0:
        size_elements = await size_locator.all()

        for size_element in size_elements:
            size_text = await size_element.inner_text()
            check_available = await size_element.get_attribute("class")

            # Check if size is available (not sold out)
            is_available = True
            if check_available and "sold-out" in check_available:
                is_available = False

            sizes.append(
                Size(
                    size=size_text.strip() if size_text else "",
                    is_available=is_available,
                )
            )
    else:
        # No size options, single size product
        sizes.append(Size(size="OneSize", is_available=True))

    return sizes


async def extract_description(page: Page) -> str | None:
    """
    Extracts product description.
    Replace selector with appropriate one for your store.
    """
    # Replace selector with appropriate one for your store
    description_locator = page.locator("ul.content-list")
    if await description_locator.count() > 0:
        return await description_locator.first.inner_text()
    return None


async def extract_shipping_and_returns(page: Page) -> str | None:
    """
    Extracts shipping and returns information.
    Replace selector with appropriate one for your store.
    """
    # Replace selector with appropriate one for your store
    shipping_locator = page.locator("#accordion-pdp-content-shipping-return div")
    if await shipping_locator.count() > 0:
        return await shipping_locator.first.inner_text()
    return None


async def find_entity(page: Page, url: str) -> None:
    await go_to_url(page=page, url=url)
    try:
        await page.wait_for_selector("#onetrust-accept-btn-handler", timeout=60000)
        await page.click("#onetrust-accept-btn-handler")
        print("Accepted cookies")
        await page.wait_for_timeout(1000)
    except Exception:
        pass


async def automation(
    page: Page,
    params: EcommereceDetailsParams,
    context: BrowserContext | None = None,
    **_kwargs,
) -> ProductDetails:
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
    params = EcommereceDetailsParams(**params)
    if not params.details_url:
        raise ValueError("Params with details_url are required for this automation")

    details_url = params.details_url
    print(f"Fetching product details: {details_url}")

    await find_entity(page, details_url)

    # Dismiss any modals - replace with appropriate action for your store
    try:
        await page.keyboard.press("Escape")
    except Exception:
        pass

    # Wait for product title to load - replace selector
    await page.wait_for_selector("h1.product-name", timeout=60000)

    # Extract title - replace selector
    title_locator = page.locator("h1.product-name")
    title = (
        await title_locator.first.inner_text() if await title_locator.count() > 0 else params.name
    )

    # Extract price information
    price_info = await extract_price_info(page)

    # Extract sizes
    sizes = await extract_sizes(page)

    # Extract description
    description = await extract_description(page)

    # Extract shipping and returns
    shipping_and_returns = await extract_shipping_and_returns(page)

    product_details: ProductDetails = ProductDetails(
        source_url=details_url,
        name=title.strip() if title else "",
        price=price_info.get("price", ""),
        sale_price=price_info.get("sale_price", None),
        sale_offer=price_info.get("sale_offer", None),
        sizes=sizes,
        description=description,
        shipping_and_returns=shipping_and_returns,
    )

    print(f"Extracted details for: {product_details.name}")
    return product_details
