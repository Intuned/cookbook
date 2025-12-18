from playwright.async_api import Page
from typing import TypedDict, Dict, NotRequired
from lib.anthropic.utils.loop import sampling_loop
import os


class Params(TypedDict):
    query: str  # The task you want the AI to perform


async def automation(page: Page, params: Params | None = None, **_kwargs):
    if not params or not params.get("query"):
        raise ValueError("Query is required, please provide a query in the params")
    
    # Get API key from environment
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY environment variable is required")
    
    # Hardcoded model
    model = "claude-sonnet-4-20250514"
    
    # Set viewport size to match the computer tool's display dimensions
    await page.set_viewport_size({"width": 1280, "height": 720})
    
    final_messages = await sampling_loop(
        model=model,
        messages=[{
            "role": "user",
            "content": params["query"],
        }],
        api_key=str(api_key),
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
            block["text"] for block in last_message["content"]  # type: ignore[index]
            if isinstance(block, Dict) and block.get("type") == "text"
        )

    return {"result": result}
