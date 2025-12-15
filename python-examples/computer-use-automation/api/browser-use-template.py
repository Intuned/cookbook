from playwright.async_api import Page
from typing import TypedDict, NotRequired
from browser_use import Agent, ChatOpenAI, Browser, Tools
from intuned_runtime import attempt_store


class Params(TypedDict):
    check_in_date: str                # Check-in date in DD/MM/YYYY format
    check_out_date: str               # Check-out date in DD/MM/YYYY format
    budget: float                     # Maximum budget in pounds
    first_name: str                   # Guest first name
    last_name: str                    # Guest last name
    phone_number: str                 # Guest phone number
    email: str                        # Guest email
    extra_details: NotRequired[str]   # Additional requirements or preferences
    model: NotRequired[str]           # Model to use (default: 'gpt-5-nano')


async def automation(page: Page, params: Params | None = None, **_kwargs):
    if params is None:
        raise Exception("params cannot be null")
    
    # Validate required parameters
    if not all(k in params for k in ['check_in_date', 'check_out_date', 'budget', 'first_name', 'last_name', 'phone_number', 'email']):
        raise ValueError("All booking parameters are required: check_in_date, check_out_date, budget, first_name, last_name, phone_number, email")
    
    # Set viewport size to match the computer tool's display dimensions
    await page.set_viewport_size({"width": 1280, "height": 720})
    
    browser: Browser = attempt_store.get("browser")

    check_in_date = params["check_in_date"]
    check_out_date = params["check_out_date"]
    budget = params["budget"]
    first_name = params["first_name"]
    last_name = params["last_name"]
    phone_number = params["phone_number"]
    email = params["email"]
    extra_details = params.get("extra_details", "")
    model = params.get("model", "gpt-5-nano")

    tools = Tools()

    agent = Agent(
        browser=browser,
        task=f"""1. Go to https://automationintesting.online.
2. Fill in the check-in date '{check_in_date}' and check-out date '{check_out_date}' in the format DD/MM/YYYY (all numbers). Hit search.
3. Find a room that is within the budget of '{budget} pounds'. {f"Keep in mind the following: '{extra_details}'" if extra_details else ""}
4. Book the room with first name '{first_name}' last name '{last_name}' phone number '{phone_number}' email '{email}'""",
        llm=ChatOpenAI(model=model, temperature=0),
        flash_mode=True,
        tools=tools,
    )

    # Agent will run the task on current browser page
    # Since Browser-use uses CDP directly, the actions done by the agent won't be visible in the Playwright trace
    await agent.run()

    return {
        "success": True,
        "check_in_date": check_in_date,
        "check_out_date": check_out_date,
        "budget": budget,
        "guest_name": f"{first_name} {last_name}",
        "message": f"Successfully booked a room for {first_name} {last_name}"
    }
