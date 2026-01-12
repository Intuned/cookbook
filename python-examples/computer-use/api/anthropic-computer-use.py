from typing import TypedDict

from intuned_runtime import get_ai_gateway_config
from lib.anthropic.utils.loop import sampling_loop
from playwright.async_api import Page


class Params(TypedDict):
    query: str  # The task you want the AI to perform


async def automation(page: Page, params: Params | None = None, **_kwargs):
    if not params or not params.get("query"):
        raise ValueError("Query is required, please provide a query in the params")

    # Get AI gateway config
    base_url, api_key = get_ai_gateway_config()

    # Hardcoded model
    model = "claude-haiku-4-5"

    # Set viewport size to match the computer tool's display dimensions
    await page.set_viewport_size({"width": 1280, "height": 720})

    final_messages = await sampling_loop(
        model=model,
        messages=[
            {
                "role": "user",
                "content": params["query"],
            }
        ],
        api_key=api_key,
        base_url=base_url,
        thinking_budget=1024,
        playwright_page=page,
    )

    # Extract the final result
    if not final_messages:
        raise ValueError("No messages were generated during the sampling loop")

    last_message = final_messages[-1]
    if not last_message:
        raise ValueError("Failed to get the last message from the sampling loop")

    result = ""
    if isinstance(last_message.get("content"), str):
        result = last_message["content"]  # type: ignore[assignment]
    else:
        result = "".join(
            block["text"]
            for block in last_message["content"]  # type: ignore[index]
            if isinstance(block, dict) and block.get("type") == "text"
        )

    return {"result": result}
