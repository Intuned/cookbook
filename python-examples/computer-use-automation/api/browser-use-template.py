from playwright.async_api import Page
from typing import TypedDict, NotRequired
from browser_use import Agent, ChatOpenAI, Browser, Tools
from intuned_runtime import attempt_store


class Params(TypedDict):
    query: str  # The task you want the AI to perform


async def automation(page: Page, params: Params | None = None, **_kwargs):
    if not params or not params.get("query"):
        raise ValueError("Query is required, please provide a query in the params")
    
    # Set viewport size to match the computer tool's display dimensions
    await page.set_viewport_size({"width": 1280, "height": 720})
    
    browser: Browser = attempt_store.get("browser")

    tools = Tools()

    agent = Agent(
        browser=browser,
        task=params["query"],
        llm=ChatOpenAI(model="gpt-4o", temperature=0),
        flash_mode=True,
        tools=tools,
    )

    # Agent will run the task on current browser page
    # Since Browser-use uses CDP directly, the actions done by the agent won't be visible in the Playwright trace
    result = await agent.run()

    return {
        "result": "Task completed successfully",
        "history": result.history() if hasattr(result, 'history') else []
    }
