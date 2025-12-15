from playwright.async_api import Page
from typing import TypedDict, NotRequired
import os
import datetime
from lib.openai.computers.playwright_computer import PlaywrightComputer
from lib.openai.agent import Agent


class Params(TypedDict):
    query: str                        # The task you want the AI to perform
    api_key: NotRequired[str]         # Your OpenAI API key
    model: NotRequired[str]           # Model to use (default: 'computer-use-preview')


async def automation(page: Page, params: Params | None = None, **_kwargs):
    if not params or not params.get("query"):
        raise ValueError("Query is required, please provide a query in the params")
    
    # Get API key from params or env
    api_key = params.get("api_key") or os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("API key is required (provide via params or OPENAI_API_KEY env var)")
    
    # Get model from params or use default
    model = params.get("model", "computer-use-preview")
    
    # Set viewport size to match the computer tool's display dimensions
    await page.set_viewport_size({"width": 1280, "height": 720})
    
    # Create computer instance using the provided page
    computer = PlaywrightComputer(page)
    
    # Setup the agent
    agent = Agent(
        model=model,
        api_key=api_key,
        computer=computer,
        tools=[],  # can provide additional tools to the agent
        acknowledge_safety_check_callback=lambda message: (
            print(f"> agent: safety check message (auto-acknowledging): {message}") or True
        )
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
        {
            "role": "user",
            "content": params["query"]
        }
    ]
    
    # Run the agent
    response_items = await agent.run_full_turn(
        input_items,
        print_steps=True,
        debug=False,
        show_images=False,
    )
    
    if not response_items or "content" not in response_items[-1]:
        raise ValueError("No response from agent")
    
    # Extract the final result
    content = response_items[-1]["content"]
    if isinstance(content, list) and content and isinstance(content[0], dict) and "text" in content[0]:
        result = content[0]["text"]
    elif isinstance(content, str):
        result = content
    else:
        result = str(content)
    
    return {"result": result}
