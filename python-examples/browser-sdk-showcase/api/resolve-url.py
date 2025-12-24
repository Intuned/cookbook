# https://docs.intunedhq.com/automation-sdks/intuned-sdk/python/helpers/functions/resolve_url
from playwright.async_api import Page
from typing import TypedDict
from intuned_browser import resolve_url
# from intuned_runtime import extend_payload


class Params(TypedDict):
    pass
    


async def automation(page: Page, params: Params | None = None, **_kwargs):
    # Resolve a relative URL to an absolute URL
    absolute_url = await resolve_url(
        url="/api/users",
        base_url="https://example.com"
    )
    print("Result of resolving relative URL to absolute URL:")
    print(absolute_url)
    
    # Resolve relative URL from the current page
    await page.goto("https://intunedhq.com")
    absolute_url = await resolve_url(
        url="/blog/intuned-act-3",
        page=page
    )
    print("Result of resolving relative URL from the current page:")
    print(absolute_url)
    
    # Resolve relative URL from an anchor tag
    await page.goto("https://intunedhq.com")
    absolute_url = await resolve_url(
        url=page.locator("a:has-text('Schedule a demo')")
    )
    print("Result of resolving relative URL from an anchor tag:")
    print(absolute_url)
    
    return "Success"