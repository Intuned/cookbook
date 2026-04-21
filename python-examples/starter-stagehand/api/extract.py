"""
Minimal Stagehand starter: navigate to a URL and extract data with a
natural-language instruction using Intuned's managed AI gateway.
"""

from typing import TypedDict

from intuned_runtime import attempt_store, get_ai_gateway_config
from playwright.async_api import Page
from stagehand import AsyncStagehand
from stagehand.types.model_config_param import ModelConfigParam
from stagehand.types.session_start_params import Browser, BrowserLaunchOptions


class Params(TypedDict):
    url: str
    instruction: str


async def automation(page: Page, params: Params, **_kwargs):
    url = params.get("url")
    instruction = params.get("instruction")
    if not url or not instruction:
        raise ValueError("url and instruction are required")

    base_url, api_key = get_ai_gateway_config()
    cdp_url = attempt_store.get("cdp_url")

    model_name = "openai/gpt-5-mini"
    model_config: ModelConfigParam = {
        "model_name": model_name,
        "api_key": api_key,
        "base_url": base_url,
        "provider": "openai",
    }

    client = AsyncStagehand(
        server="local",
        model_api_key=api_key,
        local_ready_timeout_s=30.0,
    )

    launch_options: BrowserLaunchOptions = {"headless": False}
    if cdp_url is not None:
        launch_options["cdp_url"] = str(cdp_url)
    browser: Browser = {"type": "local", "launch_options": launch_options}

    session = await client.sessions.start(model_name=model_name, browser=browser)
    session_id = session.data.session_id

    try:
        await client.sessions.navigate(id=session_id, url=url)
        result = await client.sessions.extract(
            id=session_id,
            instruction=instruction,
            options={"model": model_config},
        )
        return result.data.result
    finally:
        await client.sessions.end(session_id)
