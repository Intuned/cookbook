"""
Minimal Stagehand starter: navigate to a URL and extract data with a
natural-language instruction using Intuned's managed AI gateway.
"""

from typing import TypedDict

from intuned_runtime import attempt_store, get_ai_gateway_config
from playwright.async_api import BrowserContext, Page
from pydantic import BaseModel
from stagehand import Stagehand


class Params(TypedDict):
    url: str
    instruction: str


class ExtractedItem(BaseModel):
    title: str
    detail: str | None = None


class ExtractedResponse(BaseModel):
    items: list[ExtractedItem]


async def automation(
    page: Page,
    params: Params,
    context: BrowserContext | None = None,
    **_kwargs,
):
    url = params.get("url")
    instruction = params.get("instruction")
    if not url or not instruction:
        raise ValueError("url and instruction are required")

    base_url, api_key = get_ai_gateway_config()
    cdp_url = attempt_store.get("cdp_url")

    stagehand = Stagehand(
        env="LOCAL",
        local_browser_launch_options=dict(
            cdp_url=cdp_url, viewport=dict(width=1280, height=800)
        ),
        model_api_key=api_key,
        model_client_options={"baseURL": base_url},
    )
    await stagehand.init()
    try:
        await page.goto(url)
        result = await stagehand.extract(instruction, ExtractedResponse)
        return result.model_dump() if hasattr(result, "model_dump") else result
    finally:
        await stagehand.close()
