from typing import TypedDict

from intuned_runtime import attempt_store, get_ai_gateway_config
from playwright.async_api import Page
from pydantic import BaseModel

from stagehand import Stagehand


class Params(TypedDict):
    category: str | None


class BookDetails(BaseModel):
    title: str
    price: str
    rating: str | None = None
    availability: str | None = None


class BooksResponse(BaseModel):
    books: list[BookDetails]


MAX_PAGES = 10


async def automation(page: Page, params: Params, **_kwargs):
    base_url, api_key = get_ai_gateway_config()
    cdp_url = attempt_store.get("cdp_url")

    # Initialize Stagehand with act/extract/observe capabilities
    stagehand = Stagehand(
        env="LOCAL",
        local_browser_launch_options=dict(
            cdp_url=cdp_url, viewport=dict(width=1280, height=800), downloadPath="./tmp"
        ),
        model_api_key=api_key,
        model_client_options={
            "baseURL": base_url,
        },
    )
    await stagehand.init()
    print("\nInitialized 🤘 Stagehand")

    await page.set_viewport_size({"width": 1280, "height": 800})

    category = params.get("category")
    all_books: list[BookDetails] = []

    try:
        await stagehand.page.goto("https://books.toscrape.com")

        # Navigate to category if specified using act
        if category:
            # Use observe to find the category link in the sidebar
            observed = await stagehand.page.observe(
                f'the "{category}" category link in the sidebar'
            )
            print(f"Observed category link: {observed}")

            # Use act to click on the category
            await stagehand.page.act(
                f'Click on the "{category}" category link in the sidebar'
            )
            print(f"Navigated to {category} category")

        # Collect books from all pages
        for page_num in range(1, MAX_PAGES + 1):
            print(f"Extracting books from page {page_num}...")

            # Extract all book details from the current page
            result = await stagehand.page.extract(
                "Extract all books visible on the page with their complete details including title, price, rating, and availability",
                schema=BooksResponse,
            )
            all_books.extend(result.books)
            print(
                f"Found {len(result.books)} books on page {page_num}, total: {len(all_books)}"
            )

            # Check if there's a next page and navigate to it
            if page_num < MAX_PAGES:
                try:
                    # Use observe to check if next button exists
                    next_button = await stagehand.page.observe(
                        'the "next" button or link to go to the next page'
                    )
                    if not next_button:
                        print("No more pages available")
                        break

                    # Use act to click the next button
                    await stagehand.page.act(
                        'Click the "next" button to go to the next page'
                    )
                    print(f"Navigated to page {page_num + 1}")
                except Exception as e:
                    print(f"No more pages or navigation failed: {e}")
                    break

    finally:
        # Cleanup Stagehand
        print("\nClosing 🤘 Stagehand...")
        await stagehand.close()

    return BooksResponse(books=all_books)
