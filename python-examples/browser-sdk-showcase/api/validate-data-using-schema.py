from playwright.async_api import Page
from typing import TypedDict
from intuned_browser import validate_data_using_schema

class Params(TypedDict):
    pass

async def automation(page: Page, params: Params | None = None, **_kwargs):
    user_data = {
        "name": "John Doe",
        "email": "john@example.com",
        "age": 30
    }
    user_schema = {
        "type": "object",
        "required": ["name", "email", "age"],
        "properties": {
            "name": {"type": "string", "minLength": 1},
            "email": {"type": "string", "format": "email"},
            "age": {"type": "number", "minimum": 0}
        }
    }
    validate_data_using_schema(user_data, user_schema)
    return "Data validated successfully"