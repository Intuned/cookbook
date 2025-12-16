from playwright.async_api import Page, BrowserContext, Response
from typing import List, Callable, Awaitable, Optional
from intuned_browser import go_to_url, wait_for_network_settled
from utils.types_and_schemas import Params, Consultation


# Global storage
api_data: List[Consultation] = []
csrf_token: Optional[str] = None


def create_response_handler(pattern: str) -> Callable[[Response], Awaitable[None]]:
    async def handle_response(response: Response) -> None:
        global api_data, csrf_token

        if pattern not in response.url:
            return

        # Capture CSRF token from response headers
        if csrf_token is None:
            headers = response.headers
            csrf_token = (
                headers.get("x-csrf-token")
                or headers.get("x-xsrf-token")
                or headers.get("csrf-token")
            )

        # Capture API data
        try:
            data = await response.json()
            if isinstance(data, list):
                api_data.extend([Consultation(**item) for item in data])
            else:
                api_data.append(Consultation(**data))
        except Exception:
            pass

    return handle_response


async def automation(
    page: Page,
    params: Params,
    context: BrowserContext | None = None,
    **_kwargs,
):
    global api_data, csrf_token
    api_data = []
    csrf_token = None

    params = Params(**params)
    if not params.url:
        raise ValueError("url is required in params")

    url = params.url
    api_pattern = params.api_pattern
    max_pages = params.max_pages

    response_handler = create_response_handler(api_pattern)
    page.on("response", response_handler)

    try:
        await wait_for_network_settled(
            page=page,
            func=lambda: go_to_url(page, url),
            timeout_s=20,
        )

        current_page = 1

        while current_page < max_pages:
            next_button = await page.query_selector("#next-page-btn")
            if not next_button or await next_button.is_disabled():
                break

            items_before = len(api_data)

            await wait_for_network_settled(
                page=page,
                func=lambda: next_button.click(),
                timeout_s=20,
            )

            if len(api_data) == items_before:
                break

            current_page += 1

        return {
            "data": api_data,
            "csrf_token": csrf_token,
        }

    finally:
        page.remove_listener("response", response_handler)
