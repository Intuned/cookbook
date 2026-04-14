import json
from collections.abc import Callable

from lib.openai.agent.utils import create_response, sanitize_message
from lib.openai.computers import Computer


class Agent:
    """
    An async agent class that can be used to interact with a computer using OpenAI's API.
    """

    def __init__(
        self,
        model="gpt-5.4",
        api_key: str = None,
        base_url: str = None,
        computer: Computer = None,
        tools: list[dict] | None = None,
        acknowledge_safety_check_callback: Callable = lambda message: True,
    ):
        self.model = model
        self.api_key = api_key
        self.base_url = base_url
        self.computer = computer
        self.tools = list(tools or [])
        self.print_steps = True
        self.debug = False
        self.show_images = False
        self.acknowledge_safety_check_callback = acknowledge_safety_check_callback

        if computer:
            self.tools.append({"type": "computer"})

    def debug_print(self, *args):
        if self.debug:
            print(json.dumps(args, indent=4))

    async def handle_item(self, item):
        """Handle each item; may cause a computer action + screenshot."""
        if item["type"] == "message":
            if self.print_steps:
                text_blocks = [
                    block["text"]
                    for block in item.get("content", [])
                    if isinstance(block, dict) and "text" in block
                ]
                if text_blocks:
                    print("\n".join(text_blocks))

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
            actions = item.get("actions") or (
                [item["action"]] if "action" in item else []
            )
            for action in actions:
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
                "output": {
                    "type": "computer_screenshot",
                    "image_url": f"data:image/png;base64,{screenshot_base64}",
                    "detail": "original",
                },
            }

            return [call_output]
        return []

    async def run_full_turn(
        self, input_items, print_steps=True, debug=False, show_images=False
    ):
        self.print_steps = print_steps
        self.debug = debug
        self.show_images = show_images
        new_items = []
        current_input = input_items
        previous_response_id = None

        # keep looping until we get a final response
        while new_items[-1].get("role") != "assistant" if new_items else True:
            self.debug_print(
                [sanitize_message(msg) for msg in current_input]
                + (
                    [{"previous_response_id": previous_response_id}]
                    if previous_response_id
                    else []
                )
            )

            response = create_response(
                api_key=self.api_key,
                base_url=self.base_url,
                model=self.model,
                input=current_input,
                previous_response_id=previous_response_id,
                tools=self.tools,
            )
            self.debug_print(response)
            previous_response_id = response.get("id")

            if "output" not in response and self.debug:
                print(response)
                raise ValueError("No output from model")
            else:
                current_input = []
                new_items += response["output"]
                for item in response["output"]:
                    handled_items = await self.handle_item(item)
                    new_items += handled_items
                    current_input += handled_items

        return new_items
