from playwright.async_api import Page
from pydantic import BaseModel, Field
from intuned_browser.ai import extract_structured_data
from typing import Any, Dict, List


class Product(BaseModel):
    """Schema for a single product."""

    name: str = Field(description="Product name")
    price: str = Field(description="Product price")
    stock: str = Field(description="Stock status")
    category: str = Field(description="Product category")


class Products(BaseModel):
    """Schema for the list of products."""

    products: List[Product] = Field(description="List of products from the table")


async def automation(page: Page, params: Dict[str, Any] | None = None, **_kwargs):
    await page.goto("https://www.scrapingcourse.com/table-parsing")

    # Extract products using AI - no selectors needed
    result = await extract_structured_data(
        source=page,
        data_schema=Products,
        prompt="Extract all products from the table",
    )

    print(f"Extracted {len(result['products'])} products")
    return result["products"]
