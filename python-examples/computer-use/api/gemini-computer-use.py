import os
from typing import TypedDict, cast

from intuned_runtime import attempt_store

from stagehand import Stagehand, StagehandPage


class Params(TypedDict):
    query: str  # The task you want the AI to perform


async def automation(page: StagehandPage, params: Params, *args: ..., **kwargs: ...):
    if not params or not params.get("query"):
        raise ValueError("Query is required, please provide a query in the params")

    stagehand = cast(Stagehand, attempt_store.get("stagehand"))

    print("Starting Computer Use Agent...")
    print(f"Task: {params['query']}")

    # Create agent with computer use capabilities for autonomous web browsing
    print("Creating Computer Use Agent...")
    agent = stagehand.agent(
        provider="google",
        model="gemini-2.5-computer-use-preview-10-2025",
        instructions=f"""You are a helpful assistant that can use a web browser.
You are currently on the following page: {page.url}.
Do not ask follow up questions, the user will trust your judgement. 
If you are getting blocked on google, try another search engine.""",
    )

    # Execute the autonomous task with the Computer Use Agent
    try:
        result = await agent.execute(
            instruction=params["query"], max_steps=30, auto_screenshot=True
        )
    except Exception as e:
        error_str = str(e).lower()
        if any(
            kw in error_str
            for kw in [
                "credit",
                "quota",
                "rate limit",
                "rate_limit",
                "insufficient",
                "payment",
                "402",
            ]
        ):
            raise RuntimeError(
                "❌ AI credits exceeded or rate limit reached. "
                "Please check your API key quota or Intuned account credit balance."
            ) from e
        raise

    print("Task completed!")
    print(f"Result: {result}")

    # Return the result
    return {
        "result": str(result),
        "message": getattr(result, "message", "Task executed"),
        "details": str(result),
    }
