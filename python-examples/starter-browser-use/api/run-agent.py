"""
Minimal browser-use starter: run a natural-language task on the current
browser using Intuned's managed AI gateway.
"""

from typing import TypedDict

from browser_use import Agent, Browser, ChatOpenAI
from intuned_runtime import attempt_store, get_ai_gateway_config
from playwright.async_api import Page


class Params(TypedDict):
    task: str


async def automation(page: Page, params: Params, **_kwargs):
    task = params.get("task") if params else None
    if not task:
        raise ValueError("task is required")

    base_url, api_key = get_ai_gateway_config()
    browser: Browser = attempt_store.get("browser")

    agent = Agent(
        browser=browser,
        task=task,
        llm=ChatOpenAI(
            model="gpt-5-mini",
            temperature=0,
            base_url=base_url,
            api_key=api_key,
        ),
        flash_mode=True,
    )

    result = await agent.run()
    return {
        "success": result.is_successful(),
        "final_message": result.final_result() or "No result",
        "total_actions": result.number_of_steps(),
    }
