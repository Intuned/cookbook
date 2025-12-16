from typing import TypedDict, cast
from intuned_runtime import attempt_store
from pydantic import BaseModel
from stagehand import Stagehand, StagehandPage
import os


class Params(TypedDict):
    criteria: str


async def automation(page: StagehandPage, params: Params, *args: ..., **kwargs: ...):
    criteria = params["criteria"]
    stagehand = cast(Stagehand, attempt_store.get("stagehand"))

    await page.goto("https://www.nasdaq.com/market-activity/stocks")

    agent = stagehand.agent(
        provider="openai",
        model="computer-use-preview",
        options={"apiKey": os.getenv("OPENAI_API_KEY")},
    )

    # Agent runs on current Stagehand page
    await agent.execute(
        f"Find and open the page on one stock based on the following criteria: {criteria}.",
    )

    class StockDetails(BaseModel):
        name: str
        symbol: str
        industry: str
        shareVolume: int | None = None
        averageVolume: int | None = None
        marketCap: int

    # Extract stock details from the page using Stagehand
    return await page.extract(
        "Extract the stock details. If the current page is not a stock page, return null",
        schema=StockDetails,
    )
