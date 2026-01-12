import datetime
from typing import TypedDict

from intuned_runtime import get_ai_gateway_config
from lib.openai.agent import Agent
from lib.openai.computers.playwright_computer import PlaywrightComputer
from playwright.async_api import Page


class Params(TypedDict):
    query: str  # The task you want the AI to perform


async def automation(page: Page, params: Params | None = None, **_kwargs):
    if not params or not params.get("query"):
        raise ValueError("Query is required, please provide a query in the params")

    # Get AI gateway config
    base_url, api_key = get_ai_gateway_config()

    # Hardcoded model
    model = "computer-use-preview"

    print("\n🤖 Starting OpenAI Computer Use Agent...")
    print(f"📋 Task: {params['query']}\n")

    # Set viewport size to match the computer tool's display dimensions
    await page.set_viewport_size({"width": 1280, "height": 720})

    # Create computer instance using the provided page
    computer = PlaywrightComputer(page)

    # Setup the agent
    agent = Agent(
        model=model,
        api_key=api_key,
        base_url=base_url,
        computer=computer,
        tools=[],  # can provide additional tools to the agent
        acknowledge_safety_check_callback=lambda message: (
            print(f"⚠️  Safety check: {message}") or True
        ),
    )

    # Prepare input messages
    input_items = [
        {
            "role": "system",
            "content": f"""<SYSTEM_CAPABILITY>
- Current date and time: {datetime.datetime.utcnow().isoformat()} ({datetime.datetime.utcnow().strftime('%A')})
- You have a web browser already open and ready to use
- Use the 'goto' tool to navigate to websites
</SYSTEM_CAPABILITY>

<IMPORTANT_INSTRUCTIONS>
- You are a fully autonomous agent. NEVER ask the user for permission or confirmation.
- NEVER say "Would you like me to..." or "Should I proceed..." or ask any questions.
- When given a task, complete it immediately and fully without hesitation.
- Take all necessary actions to complete the task from start to finish.
- If you encounter a button, form, or interaction needed to complete the task, USE IT immediately.
- Report what you DID, not what you CAN do or what you FOUND.
- Complete the entire task before responding with your final answer.
</IMPORTANT_INSTRUCTIONS>""",
        },
        {"role": "user", "content": params["query"]},
    ]

    # Run the agent
    response_items = await agent.run_full_turn(
        input_items,
        print_steps=False,  # Disable verbose step output
        debug=False,  # Disable raw JSON debug output
        show_images=False,
    )

    if not response_items or "content" not in response_items[-1]:
        raise ValueError("No response from agent")

    # Extract the final result
    content = response_items[-1]["content"]
    if (
        isinstance(content, list)
        and content
        and isinstance(content[0], dict)
        and "text" in content[0]
    ):
        result = content[0]["text"]
    elif isinstance(content, str):
        result = content
    else:
        result = str(content)

    print("\n📝 === AGENT RESPONSE === 📝\n")
    print(f"💬 {result}\n")
    print("=== END RESPONSE ===\n")
    print("✅ Task completed!\n")

    return {"result": result}
