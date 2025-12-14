from playwright.async_api import Page
from typing import TypedDict
from intuned_browser import go_to_url
from pydantic import BaseModel, Field
from intuned_browser.ai import extract_structured_data, TextContentItem

# Define schema using Pydantic
class Person(BaseModel):
    name: str = Field(description="Person's full name")
    age: int = Field(description="Person's age")
    occupation: str = Field(description="Person's job title")
    company: str = Field(description="Company name")
    
class Params(TypedDict):
        extract_from_content: bool | None
        extract_from_page: bool | None
        extract_list : bool | None

async def automation(page: Page, params: Params | None = None, **_kwargs):
    # Extract from Text or Image content.
    extract_from_content = params.get("extract_from_content", False)
    if extract_from_content:
        text_content: TextContentItem = {
            "type": "text",
            "data": "John Doe, age 30, works as a Software Engineer at Tech Corp"
        }
        person = await extract_structured_data(
            content=text_content,
            model="gpt-4o",
            data_schema=Person,  # Pass Pydantic model directly
            prompt="Extract person information from the text",
            enable_cache=True, # To enable cache, you must run in Intuned context (IDE/CLI) and save the project, with the correct API credentials.
        )
        print(f"Found person: {person['name']}, {person['age']} years old")
        
    # Extract from the Page directly.
    extract_from_page = params.get("extract_from_page", False)

    if extract_from_page:
        class Book(BaseModel):
            name: str = Field(description="Book title")
            price: str = Field(description="Book price")
            description: str | None = Field(default=None, description="Book description")
            in_stock: bool = Field(description="Stock availability")
            rating: str | None = Field(default=None, description="Book rating")
        await go_to_url(page, 'https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html')
        product = await extract_structured_data(
            source=page,
            strategy="HTML",
            model="gpt-4o",
            data_schema=Book,  # Pass Pydantic model directly
            prompt="Extract book details from this page",
            enable_cache=False, # To enable cache, you must run in Intuned context (IDE/CLI) and save the project, with the correct API credentials.
            max_retires=3,
        )
        print(f"Found product: {product['name']} - {product['price']}")
        
        
    # Extract the list using normal schema.
    extract_list = params.get("extract_list", False)
    if extract_list:
        await go_to_url(page, 'https://books.toscrape.com')
        books = await extract_structured_data(
        source=page,
        strategy="HTML",
        model="gpt-4o",
        data_schema={
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "price": {"type": "number"},
                    "description": {"type": "string"},
                    "in_stock": {"type": "boolean"},
                    "rating": {"type": "number"},
                    "reviews_count": {"type": "integer"}
                },
                "required": ["name", "price"],
            }
        },
        prompt="Extract book details from this page",
        enable_cache=False, # To enable cache, you must run in Intuned context (IDE/CLI) and save the project, with the correct API credentials.
        max_retires=3
    )
        print(f"Found {len(books)} books")
        for book in books:
            print(f"Book: {book['name']} - {book['price']}")
    return "Success"