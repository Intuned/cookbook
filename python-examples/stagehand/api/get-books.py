from typing import TypedDict, cast
from intuned_runtime import attempt_store
from pydantic import BaseModel
from stagehand import Stagehand, StagehandPage
import os

class Params(TypedDict):
    category: str | None


async def automation(page: StagehandPage, params: Params, *args: ..., **kwargs: ...):
    # Stagehand in python uses Stagehand V2. It extends Playwright page as a StagehandPage object.
    category = params.get("category")
    stagehand = cast(Stagehand, attempt_store.get("stagehand"))
    await page.set_viewport_size({"width": 1280, "height": 800})

    await page.goto("https://books.toscrape.com")
    # This is a Computer Use Agent(CUA), it uses X,Y Coordinates to click and control the page. CUA models may behave differently depending on the viewport size.
    agent = stagehand.agent(
        provider="google",
        model="gemini-2.5-computer-use-preview-10-2025",
        instructions=f"""You are a helpful assistant that can use a web browser.
You are currently on the following page: {page.url}.
Do not ask follow up questions, the user will trust your judgement. 
If you are getting blocked on google, try another search engine.""",
    )
    # Agent runs on current Stagehand page
    if category:
        await agent.execute(
            instruction=f'Navigate to the "{category}" category by clicking on it in the sidebar',
            max_steps=30,
            auto_screenshot=True
        )

    class BookDetails(BaseModel):
        title: str
        price: str
        rating: str | None = None
        availability: str | None = None

    class BooksResponse(BaseModel):
        books: list[BookDetails]

    # Extract all book details from the page using Stagehand
    return await page.extract(
        "Extract all books visible on the page with their complete details including title, price, rating, and availability",
        schema=BooksResponse,
    )

