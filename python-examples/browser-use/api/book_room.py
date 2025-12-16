from playwright.async_api import Page
from typing import TypedDict
from browser_use import Agent, ChatOpenAI, Browser, Tools
from intuned_runtime import attempt_store


class Params(TypedDict):
    check_in_date: str
    check_out_date: str
    budget: float
    first_name: str
    last_name: str
    phone_number: str
    email: str
    extra_details: str


async def automation(page: Page, params: Params | None = None, **_kwargs):
    if params is None:
        raise Exception("params cannot be null")
    browser: Browser = attempt_store.get("browser")

    check_in_date = params["check_in_date"]
    check_out_date = params["check_out_date"]
    budget = params["budget"]
    first_name = params["first_name"]
    last_name = params["last_name"]
    phone_number = params["phone_number"]
    email = params["email"]
    extra_details = params["extra_details"]

    tools = Tools()

    agent = Agent(
        browser=browser,
        task=f"""1. Go to https://automationintesting.online.
2. Fill in the check-in date '{check_in_date}' and check-out date '{check_out_date}' in the format DD/MM/YYYY (all numbers). Hit search.
3. Find a room that is within the budget of '{budget} pounds'. {f"Keep in mind the following: '{extra_details}'" if extra_details else ""}
4. Book the room with first name '{first_name}' last name '{last_name}' phone number '{phone_number}' email '{email}'""",
        llm=ChatOpenAI(model="gpt-5-nano", temperature=0),
        flash_mode=True,
        tools=tools,
    )

    # Agent will run the task on current browser page
    # Since Browser-use uses CDP directly, the actions done by the agent won't be visible in the Playwright trace
    await agent.run()

    return None
