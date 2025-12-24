# https://docs.intunedhq.com/automation-sdks/intuned-sdk/python/ai/functions/extract_structured_data
from playwright.async_api import Page
from typing import TypedDict
from intuned_browser import go_to_url
from pydantic import BaseModel, Field
from intuned_browser.ai import extract_structured_data


class Params(TypedDict):
    pass


async def automation(page: Page, params: Params | None = None, **_kwargs):
    class Book(BaseModel):
        name: str = Field(description="Book title")
        price: str = Field(description="Book price")
        description: str | None = Field(default=None, description="Book description")
        in_stock: bool = Field(description="Stock availability")
        rating: str | None = Field(default=None, description="Book rating")

    await go_to_url(
        page,
        "https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html",
    )

    # Extract from the Page directly using Pydantic model.
    # You can also extract from a specific locator or by passing TextContentItem.
    # Check https://docs.intunedhq.com/automation-sdks/intuned-sdk/python/helpers/functions/extract_structured_data for more details.
    product = await extract_structured_data(
        source=page,
        strategy="HTML",
        model="gpt-5-mini",
        data_schema=Book,  # Pass Pydantic model directly, or use a normal json schema dictionary too.
        prompt="Extract book details from this page",
        enable_cache=False,  # To enable cache, you must run in Intuned context (IDE/CLI) and save the project, with the correct API credentials.
        max_retries=3,
    )
    print(f"Found product: {product['name']} - {product['price']}")

    return "Success"
