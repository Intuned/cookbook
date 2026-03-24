from typing import TypedDict

from intuned_browser import go_to_url
from playwright.async_api import Page


class Params(TypedDict):
    pass


async def automation(page: Page, params: Params | None = None, **_kwargs):
    sandboxed_url = "https://sandbox.intuned.dev/consultations-auth/book"

    await go_to_url(page=page, url=sandboxed_url)

    return {}
