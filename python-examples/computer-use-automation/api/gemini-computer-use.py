from typing import TypedDict, NotRequired, cast
from intuned_runtime import attempt_store
from pydantic import BaseModel
from stagehand import Stagehand, StagehandPage
import os


class Params(TypedDict):
    query: str                        # The task you want the AI to perform
    api_key: NotRequired[str]         # Your Google Generative AI API key
    model: NotRequired[str]           # Model to use (default: 'gemini-2.5-computer-use-preview-10-2025')


async def automation(page: StagehandPage, params: Params, *args: ..., **kwargs: ...):
    if not params or not params.get("query"):
        raise ValueError("Query is required, please provide a query in the params")
    
    # Get API key from params or env
    api_key = params.get("api_key") or os.getenv("GOOGLE_GENERATIVE_AI_API_KEY")
    if not api_key:
        raise ValueError("API key is required (provide via params or GOOGLE_GENERATIVE_AI_API_KEY env var)")
    
    # Get model from params or use default
    model = params.get("model", "gemini-2.5-computer-use-preview-10-2025")
    
    stagehand = cast(Stagehand, attempt_store.get("stagehand"))

    # Set viewport size to match the computer tool's display dimensions
    await page.set_viewport_size({"width": 1280, "height": 720})

    agent = stagehand.agent(
        provider="google",
        model=model,
        options={"apiKey": api_key},
    )

    # Agent runs on current Stagehand page
    result = await agent.execute(params["query"])
    
    return {
        "result": "Task completed successfully" if result else "Task failed",
        "success": bool(result)
    }
