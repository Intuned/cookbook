from typing import TypedDict
import os
from intuned_runtime import attempt_store, get_ai_gateway_config
from playwright.async_api import Page
from pydantic import BaseModel

from stagehand import AsyncStagehand


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
    model_api_key = os.getenv("MODEL_API_KEY")
    cdp_url = attempt_store.get("cdp_url")
    print(f"CDP URL: {cdp_url}")
    print(f"Base URL: {base_url}")
    # Initialize Stagehand with act/extract/observe capabilities
    client = AsyncStagehand(
        server="local",
        model_api_key=model_api_key,
        local_ready_timeout_s=30.0,
        base_url=base_url,
    )
    print("⏳ Starting local session (this will start the embedded SEA binary)...")
    session = await client.sessions.start(
        model_name="openai/gpt-5-mini",
        browser={
            "type": "local",
            "launchOptions": {
                "headless": False,
                "cdpUrl": cdp_url,
            },
        },
    )
    session_id = session.data.session_id
    print(f"✅ Session started: {session_id}")
    print("\nInitialized 🤘 Stagehand")

    await page.set_viewport_size({"width": 1280, "height": 800})

    category = params.get("category")
    all_books: list[BookDetails] = []

    try:
        # Navigate using Stagehand's API
        await client.sessions.navigate(
            id=session_id,
            url="https://books.toscrape.com",
        )

        # Navigate to category if specified using act
        if category:
            # Use observe to find the category link
            observed = await client.sessions.observe(
                id=session_id,
                instruction=f'the "{category}" category link in the sidebar',
            )
            print(f"Observed category link: {observed.data.result}")

            # Use act to click on the category
            await client.sessions.act(
                id=session_id,
                input=f'Click on the "{category}" category link in the sidebar',
            )
            print(f"Navigated to {category} category")

        # Collect books from all pages
        for page_num in range(1, MAX_PAGES + 1):
            print(f"Extracting books from page {page_num}...")

            # Extract all book details from the current page using simple JSON schema
            result = await client.sessions.extract(
                id=session_id,
                instruction="Extract all books on this page including title, price, rating and availability for each book",
                schema={
                    "type": "object",
                    "properties": {
                        "books": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "title": {"type": "string"},
                                    "price": {"type": "string"},
                                    "rating": {"type": "string"},
                                    "availability": {"type": "string"},
                                },
                                "required": ["title", "price"],
                            },
                        }
                    },
                    "required": ["books"],
                },
            )

            # Parse the result into BooksResponse
            books_data = BooksResponse.model_validate(result.data.result)
            all_books.extend(books_data.books)
            print(
                f"Found {len(books_data.books)} books on page {page_num}, total: {len(all_books)}"
            )

            # Check if there's a next page and navigate to it
            if page_num < MAX_PAGES:
                try:
                    # Use observe to check if next button exists
                    next_button = await client.sessions.observe(
                        id=session_id,
                        instruction='the "next" button or link to go to the next page',
                    )
                    if not next_button.data.result:
                        print("No more pages available")
                        break

                    # Use act to click the next button
                    await client.sessions.act(
                        id=session_id,
                        input='Click the "next" button to go to the next page',
                    )
                    print(f"Navigated to page {page_num + 1}")
                except Exception as e:
                    print(f"No more pages or navigation failed: {e}")
                    break
    finally:
        # Cleanup Stagehand
        print("\nClosing 🤘 Stagehand...")
        await client.sessions.end(session_id)
        print("✅ Session ended")

    return BooksResponse(books=all_books)
