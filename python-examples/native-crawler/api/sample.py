from playwright.async_api import Page
from typing import TypedDict
# from intuned_runtime import extend_payload


class Params(TypedDict):
    pass


async def automation(page: Page, params: Params | None = None, **_kwargs):
    result = dict()
    return result
