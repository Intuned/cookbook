from intuned_browser import go_to_url
from intuned_browser.ai import extract_structured_data
from playwright.async_api import BrowserContext, Page
from pydantic import BaseModel, Field


class EcommereceDetailsParams(BaseModel):
    name: str = Field(..., description="The name of the product")
    price: str = Field(..., description="The price of the product")
    details_url: str = Field(..., description="The URL of the product details")


class Size(BaseModel):
    size: str = Field(..., description="The size of the product")
    is_available: bool = Field(
        default=True, description="Whether the size is available"
    )


class ShippingOption(BaseModel):
    name: str = Field(..., description="Shipping carrier and service name")
    delivery_time: str = Field(..., description="Estimated delivery time")


class ShippingDetails(BaseModel):
    free_shipping_threshold: str | None = Field(
        default=None, description="Minimum order amount for free shipping"
    )
    return_days: int | None = Field(
        default=None, description="Number of days for returns and exchanges"
    )
    shipping_options: list[ShippingOption] = Field(
        default_factory=list, description="Available shipping options"
    )
    delivery_days: str | None = Field(
        default=None, description="Days of the week when delivery is available"
    )
    return_window_days: int | None = Field(
        default=None, description="Number of days from delivery to return"
    )
    taxes_note: str | None = Field(
        default=None, description="Note about taxes and fees"
    )


class ProductDetails(BaseModel):
    source_url: str = Field(..., description="The URL of the product details")
    name: str = Field(..., description="The name of the product")
    price: str = Field(..., description="The price of the product")
    sale_price: str | None = Field(
        default=None, description="The sale price of the product"
    )
    sale_offer: str | None = Field(
        default=None, description="The sale offer of the product"
    )
    sizes: list[Size] = Field(
        default_factory=list, description="The sizes of the product"
    )
    description: str | None = Field(
        default=None, description="The description of the product"
    )
    shipping_details: ShippingDetails | None = Field(
        default=None, description="Structured shipping and returns information"
    )


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


async def extract_sizes(page: Page) -> list[Size]:
    """
    Extracts available sizes from the product page.
    Replace selectors with appropriate ones for your store.
    """
    sizes: list[Size] = []

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
    description_element = await page.query_selector("ul.content-list")
    if description_element:
        return await description_element.inner_text()
    return None


async def extract_shipping_and_returns(page: Page) -> ShippingDetails | None:
    """
    Extracts structured shipping and returns information using AI extraction.
    """
    shipping_schema = {
        "type": "object",
        "properties": {
            "free_shipping_threshold": {
                "type": "string",
                "description": "Minimum order amount for free shipping (e.g., '$95')",
            },
            "return_days": {
                "type": "integer",
                "description": "Number of days for returns and exchanges",
            },
            "shipping_options": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "name": {
                            "type": "string",
                            "description": "Shipping carrier and service name",
                        },
                        "delivery_time": {
                            "type": "string",
                            "description": "Estimated delivery time",
                        },
                    },
                    "required": ["name", "delivery_time"],
                },
                "description": "Available shipping options with delivery times",
            },
            "delivery_days": {
                "type": "string",
                "description": "Days of the week when delivery is available",
            },
            "return_window_days": {
                "type": "integer",
                "description": "Number of days from delivery date to return purchase",
            },
            "taxes_note": {
                "type": "string",
                "description": "Note about taxes and additional fees",
            },
        },
    }

    try:
        result = await extract_structured_data(
            source=page,
            data_schema=shipping_schema,
            model="gpt-5-mini",
            prompt="Extract shipping and returns information from this page including free shipping threshold, return policy days, shipping options with delivery times, and any notes about taxes.",
        )
        print(f"Shipping details: {result}")
        if result:
            return ShippingDetails(**result)
    except Exception as e:
        print(f"Failed to extract shipping details: {e}")

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
    await page.set_viewport_size({"width": 1280, "height": 800})
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

    # Extract shipping and returns as structured data
    shipping_details = await extract_shipping_and_returns(page)

    product_details: ProductDetails = ProductDetails(
        source_url=details_url,
        name=title.strip() if title else "",
        price=price_info.get("price", ""),
        sale_price=price_info.get("sale_price", None),
        sale_offer=price_info.get("sale_offer", None),
        sizes=sizes,
        description=description,
        shipping_details=shipping_details,
    )

    print(f"Extracted details for: {product_details.name}")
    return product_details
