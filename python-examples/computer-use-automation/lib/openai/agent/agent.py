from lib.openai.computers import Computer
from lib.openai.agent.utils import create_response, sanitize_message
import json
from typing import Callable


class Agent:
    """
    An async agent class that can be used to interact with a computer using OpenAI's API.
    """

    def __init__(
        self,
        model="computer-use-preview",
        api_key: str = None,
        computer: Computer = None,
        tools: list[dict] = [],
        acknowledge_safety_check_callback: Callable = lambda message: True,
    ):
        self.model = model
        self.api_key = api_key
        self.computer = computer
        self.tools = tools
        self.print_steps = True
        self.debug = False
        self.show_images = False
        self.acknowledge_safety_check_callback = acknowledge_safety_check_callback

        if computer:
            dimensions = computer.get_dimensions()
            self.tools += [
                {
                    "type": "computer-preview",
                    "display_width": dimensions[0],
                    "display_height": dimensions[1],
                    "environment": computer.get_environment(),
                },
                {
                    "type": "function",
                    "name": "back",
                    "description": "Go back to the previous page.",
                    "parameters": {},
                },
                {
                    "type": "function",
                    "name": "goto",
                    "description": "Go to a specific URL.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "url": {
                                "type": "string",
                                "description": "Fully qualified URL to navigate to.",
                            },
                        },
                        "additionalProperties": False,
                        "required": ["url"],
                    },
                },
                {
                    "type": "function",
                    "name": "forward",
                    "description": "Go forward to the next page.",
                    "parameters": {},
                },
            ]

    def debug_print(self, *args):
        if self.debug:
            print(json.dumps(args, indent=4))

    async def handle_item(self, item):
        """Handle each item; may cause a computer action + screenshot."""
        if item["type"] == "message":
            if self.print_steps:
                print(item["content"][0]["text"])

        if item["type"] == "function_call":
            name, args = item["name"], json.loads(item["arguments"])
            if self.print_steps:
                print(f"{name}({args})")

            if hasattr(self.computer, name):  # if function exists on computer, call it
                method = getattr(self.computer, name)
                await method(**args)
            return [
                {
                    "type": "function_call_output",
                    "call_id": item["call_id"],
                    "output": "success",
                }
            ]

        if item["type"] == "computer_call":
            action = item["action"]
            action_type = action["type"]
            action_args = {k: v for k, v in action.items() if k != "type"}
            if self.print_steps:
                print(f"{action_type}({action_args})")

            method = getattr(self.computer, action_type)
            await method(**action_args)

            screenshot_base64 = await self.computer.screenshot()

            # if user doesn't ack all safety checks exit with error
            pending_checks = item.get("pending_safety_checks", [])
            for check in pending_checks:
                message = check["message"]
                if not self.acknowledge_safety_check_callback(message):
                    raise ValueError(
                        f"Safety check failed: {message}. Cannot continue with unacknowledged safety checks."
                    )

            call_output = {
                "type": "computer_call_output",
                "call_id": item["call_id"],
                "acknowledged_safety_checks": pending_checks,
                "output": {
                    "type": "input_image",
                    "image_url": f"data:image/png;base64,{screenshot_base64}",
                },
            }

            # additional URL safety checks for browser environments
            if self.computer.get_environment() == "browser":
                current_url = await self.computer.get_current_url()
                call_output["output"]["current_url"] = current_url

            return [call_output]
        return []

    async def run_full_turn(
        self, input_items, print_steps=True, debug=False, show_images=False
    ):
        self.print_steps = print_steps
        self.debug = debug
        self.show_images = show_images
        new_items = []

        # keep looping until we get a final response
        while new_items[-1].get("role") != "assistant" if new_items else True:
            self.debug_print([sanitize_message(msg) for msg in input_items + new_items])

            response = create_response(
                api_key=self.api_key,
                model=self.model,
                input=input_items + new_items,
                tools=self.tools,
                truncation="auto",
            )
            self.debug_print(response)

            if "output" not in response and self.debug:
                print(response)
                raise ValueError("No output from model")
            else:
                new_items += response["output"]
                for item in response["output"]:
                    new_items += await self.handle_item(item)

        return new_items

