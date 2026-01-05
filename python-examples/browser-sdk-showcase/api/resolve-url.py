# https://docs.intunedhq.com/automation-sdks/intuned-sdk/python/helpers/functions/resolve_url
from typing import TypedDict

from intuned_browser import resolve_url
from playwright.async_api import Page

# from intuned_runtime import extend_payload


class Params(TypedDict):
    pass



async def automation(page: Page, params: Params | None = None, **_kwargs):
    # Resolve a relative URL to an absolute URL
    url_with_base = await resolve_url(
        url="/api/users",
        base_url="https://example.com"
    )
    print("Result of resolving relative URL to absolute URL:")
    print(url_with_base)

    # Resolve relative URL from the current page
    await page.goto("https://intunedhq.com")
    url_from_page = await resolve_url(
        url="/blog/intuned-act-3",
        page=page
    )
    print("Result of resolving relative URL from the current page:")
    print(url_from_page)

    # Resolve relative URL from an anchor tag
    await page.goto("https://intunedhq.com")
    url_from_anchor = await resolve_url(
        url=page.locator("a:has-text('Schedule a demo')")
    )
    print("Result of resolving relative URL from an anchor tag:")
    print(url_from_anchor)

    return {
        "url_with_base": url_with_base,
        "url_from_page": url_from_page,
        "url_from_anchor": url_from_anchor
    }
