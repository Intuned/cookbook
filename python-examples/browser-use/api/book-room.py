from playwright.async_api import Page
from typing import TypedDict
from browser_use import Agent, ChatOpenAI, Browser, Tools
from intuned_runtime import attempt_store


class Params(TypedDict):
    username: str
    password: str
    product_name: str
    first_name: str
    last_name: str
    zip_code: str


async def automation(page: Page, params: Params | None = None, **_kwargs):
    if params is None:
        raise Exception("params cannot be null")
    browser: Browser = attempt_store.get("browser")

    username = params["username"]
    password = params["password"]
    product_name = params["product_name"]
    first_name = params["first_name"]
    last_name = params["last_name"]
    zip_code = params["zip_code"]

    tools = Tools()

    agent = Agent(
        browser=browser,
        task=f"""1. Go to https://www.saucedemo.com/
2. Login with username '{username}' and password '{password}'
3. Find the product '{product_name}' and add it to cart
4. Go to cart
5. Proceed to checkout
6. Fill in the checkout information: First Name: '{first_name}', Last Name: '{last_name}', Zip Code: '{zip_code}'
7. Complete the purchase""",
        llm=ChatOpenAI(model="gpt-5-nano", temperature=0),
        flash_mode=True,
        tools=tools,
    )

    # Agent will run the task on current browser page
    # Since Browser-use uses CDP directly, the actions done by the agent won't be visible in the Playwright trace
    result = await agent.run()
    print(result)

    # Use the correct AgentHistoryList methods
    return {
        "success": result.is_successful(),
        "is_done": result.is_done(),
        "final_message": result.final_result() or "No result",
        "total_actions": result.number_of_steps(),
        "action_history": result.extracted_content(),
    }