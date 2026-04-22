from typing import Any

from intuned_browser import go_to_url, wait_for_network_settled
from playwright.async_api import BrowserContext, Page, Response


async def automation(
    page: Page,
    params: dict,
    context: BrowserContext | None = None,
    **_kwargs,
) -> dict[str, Any]:
    url = params["url"]
    api_pattern = params["api_pattern"]

    captured: list[Any] = []

    async def on_response(response: Response) -> None:
        if api_pattern not in response.url:
            return
        try:
            captured.append(await response.json())
        except Exception:
            pass

    page.on("response", on_response)
    try:
        await wait_for_network_settled(
            page=page,
            func=lambda: go_to_url(page, url),
            timeout_s=20,
        )
    finally:
        page.remove_listener("response", on_response)

    return {"matched": len(captured), "responses": captured}
