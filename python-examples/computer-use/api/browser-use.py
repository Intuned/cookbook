from playwright.async_api import Page
from typing import TypedDict
from browser_use import Agent, ChatOpenAI, Browser, Tools
from intuned_runtime import attempt_store, get_ai_gateway_config


class Params(TypedDict):
    query: str  # The task you want the AI to perform


async def automation(page: Page, params: Params | None = None, **_kwargs):
    if not params or not params.get("query"):
        raise ValueError("Query is required, please provide a query in the params")

    # Get AI gateway config
    base_url, api_key = get_ai_gateway_config()

    browser: Browser = attempt_store.get("browser")

    tools = Tools()

    agent = Agent(
        browser=browser,
        task=params["query"],
        llm=ChatOpenAI(model="gpt-5-mini", temperature=0, base_url=base_url, api_key=api_key),
        flash_mode=True,
        tools=tools,
    )

    # Agent will run the task on current browser page
    # Since Browser-use uses CDP directly, the actions done by the agent won't be visible in the Playwright trace
    result = await agent.run()
    print(result)

    final = result.final_result()
    
    return {
        "success": result.is_successful(),
        "is_done": result.is_done(),
        "final_message": final if final else "No result",
        "total_actions": result.number_of_steps(),
        "action_history": result.extracted_content(),
    }