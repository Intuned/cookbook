from playwright.async_api import Page, BrowserContext, Response
from typing import List, Callable, Awaitable
from intuned_browser import go_to_url, wait_for_network_settled
from utils.types_and_schemas import Params, Consultation


# Global variable to store captured API data
api_data: List[Consultation] = []


def create_response_handler(pattern: str) -> Callable[[Response], Awaitable[None]]:
    """
    Creates a response handler that captures responses matching the pattern.
    Replace the pattern with the appropriate one for your API.
    """

    async def handle_response(response: Response) -> None:
        """Capture responses matching the pattern."""
        global api_data

        if pattern in response.url:
            try:
                data = await response.json()
                if isinstance(data, list):
                    api_data.extend([Consultation(**item) for item in data])
                else:
                    api_data.append(Consultation(**data))
            except Exception:
                # Response might not be JSON
                pass

    return handle_response


async def automation(
    page: Page,
    params: Params,
    context: BrowserContext | None = None,
    **_kwargs,
) -> List[Consultation]:
    """
    Intercepts network requests to capture paginated API data.
    Clicks the "Next" button to load more pages and captures API responses.

    Example params:
    {
        "url": "https://example.com/products",
        "api_pattern": "/api/v1/products",
        "max_pages": 5
    }

    This function:
    1. Sets up a response listener for the specified pattern
    2. Navigates to the URL and captures initial data
    3. Clicks the next page button to load more data
    4. Returns all captured API data
    """
    global api_data
    api_data = []
    params = Params(**params)
    if not params.url:
        raise ValueError("url is required in params")

    url = params.url
    api_pattern = params.api_pattern
    max_pages = params.max_pages

    print(f"Navigating to: {url}")
    print(f"Listening for API pattern: {api_pattern}")
    print(f"Max pages: {max_pages}")

    # Create and attach the response handler
    response_handler = create_response_handler(api_pattern)
    page.on("response", response_handler)

    try:
        # Navigate and wait until the network is settled (initial page load)
        await wait_for_network_settled(
            page=page,
            func=lambda: go_to_url(page, url),
            timeout_s=20,
        )

        print(f"Initial load captured {len(api_data)} items")

        # Pagination: click next button to load more pages
        current_page = 1

        while current_page < max_pages:
            # Check if next button exists and is visible
            # Replace "#next-page-btn" with the appropriate selector for your store
            next_button = await page.query_selector("#next-page-btn")

            if not next_button:
                print("Next button not found, stopping pagination")
                break

            is_disabled = await next_button.is_disabled()
            if is_disabled:
                print("Next button is disabled, reached end of data")
                break

            items_before = len(api_data)

            # Click next button and wait for network to settle
            await wait_for_network_settled(
                page=page,
                func=lambda: next_button.click(),
                timeout_s=20,
            )

            items_after = len(api_data)
            new_items = items_after - items_before

            print(f"Page {current_page + 1}: captured {new_items} new items")

            # If no new items were captured, stop pagination
            if new_items == 0:
                print("No new items captured, stopping pagination")
                break

            current_page += 1

        print(f"Total items captured: {len(api_data)}")
        return api_data

    finally:
        # Clean up the event listener
        page.remove_listener("response", response_handler)
