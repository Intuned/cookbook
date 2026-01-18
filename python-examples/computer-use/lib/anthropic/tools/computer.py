"""
Modified from https://github.com/anthropics/anthropic-quickstarts/blob/main/computer-use-demo/computer_use_demo/tools/computer.py
Replaces xdotool and gnome-screenshot with Playwright.
"""

import asyncio
import base64
from typing import Literal, TypedDict, cast, get_args

from anthropic.types.beta import BetaToolComputerUse20241022Param, BetaToolUnionParam
from playwright.async_api import Page

from .base import BaseAnthropicTool, ToolError, ToolResult

TYPING_DELAY_MS = 12
TYPING_GROUP_SIZE = 50

# Map alternative names to standard Playwright modifier keys
MODIFIER_KEY_MAP = {
    "ctrl": "Control",
    "alt": "Alt",
    "cmd": "Meta",
    "command": "Meta",
    "win": "Meta",
}

# Essential key mappings for Playwright compatibility
KEY_MAP = {
    "return": "Enter",
    "space": " ",
    "left": "ArrowLeft",
    "right": "ArrowRight",
    "up": "ArrowUp",
    "down": "ArrowDown",
    "home": "Home",
    "end": "End",
    "pageup": "PageUp",
    "page_up": "PageUp",
    "pagedown": "PageDown",
    "page_down": "PageDown",
    "delete": "Delete",
    "backspace": "Backspace",
    "tab": "Tab",
    "esc": "Escape",
    "escape": "Escape",
    "insert": "Insert",
    "super_l": "Meta",
    "f1": "F1",
    "f2": "F2",
    "f3": "F3",
    "f4": "F4",
    "f5": "F5",
    "f6": "F6",
    "f7": "F7",
    "f8": "F8",
    "f9": "F9",
    "f10": "F10",
    "f11": "F11",
    "f12": "F12",
    "minus": "-",
    "equal": "=",
    "plus": "+",
}

Action_20241022 = Literal[
    "key",
    "type",
    "mouse_move",
    "left_click",
    "left_click_drag",
    "right_click",
    "middle_click",
    "double_click",
    "screenshot",
    "cursor_position",
]

Action_20250124 = (
    Action_20241022
    | Literal[
        "left_mouse_down",
        "left_mouse_up",
        "scroll",
        "hold_key",
        "wait",
        "triple_click",
    ]
)

ScrollDirection = Literal["up", "down", "left", "right"]

# Map Playwright mouse buttons to our actions
MOUSE_BUTTONS = {
    "left_click": "left",
    "right_click": "right",
    "middle_click": "middle",
}


class ComputerToolOptions(TypedDict):
    display_height_px: int
    display_width_px: int
    display_number: int | None


def chunks(s: str, chunk_size: int) -> list[str]:
    return [s[i : i + chunk_size] for i in range(0, len(s), chunk_size)]


class BaseComputerTool:
    """
    A tool that allows the agent to interact with the screen, keyboard, and mouse using Playwright.
    The tool parameters are defined by Anthropic and are not editable.
    """

    name: Literal["computer"] = "computer"
    width: int = 1280
    height: int = 720
    display_num: int | None = None
    page: Page | None = None

    _screenshot_delay = 2.0

    @property
    def options(self) -> ComputerToolOptions:
        return {
            "display_width_px": self.width,
            "display_height_px": self.height,
            "display_number": self.display_num,
        }

    def __init__(self, page: Page | None = None):
        super().__init__()
        self.page = page

    def validate_coordinates(
        self, coordinate: tuple[int, int] | list[int] | None = None
    ) -> tuple[int, int] | None:
        """Validate that coordinates are non-negative integers and convert lists to tuples if needed."""
        if coordinate is None:
            return None

        # Convert list to tuple if needed
        if isinstance(coordinate, list):
            coordinate = tuple(coordinate)

        if not isinstance(coordinate, tuple) or len(coordinate) != 2:
            raise ToolError(f"{coordinate} must be a tuple or list of length 2")

        x, y = coordinate
        if not isinstance(x, int) or not isinstance(y, int) or x < 0 or y < 0:
            raise ToolError(
                f"{coordinate} must be a tuple or list of non-negative ints"
            )

        return coordinate

    def map_key(self, key: str) -> str:
        """Map a key to its Playwright equivalent."""
        # Handle modifier keys
        if key.lower() in MODIFIER_KEY_MAP:
            return MODIFIER_KEY_MAP[key.lower()]

        # Handle special keys
        if key.lower() in KEY_MAP:
            return KEY_MAP[key.lower()]

        # Handle key combinations (e.g. "ctrl+a")
        if "+" in key:
            parts = key.split("+")
            if len(parts) == 2:
                modifier, main_key = parts
                mapped_modifier = MODIFIER_KEY_MAP.get(modifier.lower(), modifier)
                mapped_key = KEY_MAP.get(main_key.lower(), main_key)
                return f"{mapped_modifier}+{mapped_key}"

        # Return the key as is if no mapping exists
        return key

    async def __call__(
        self,
        *,
        action: Action_20241022,
        text: str | None = None,
        coordinate: tuple[int, int] | list[int] | None = None,
        **kwargs,
    ):
        if not self.page:
            raise ToolError("Playwright page not initialized")

        if action in ("mouse_move", "left_click_drag"):
            if coordinate is None:
                raise ToolError(f"coordinate is required for {action}")
            if text is not None:
                raise ToolError(f"text is not accepted for {action}")

            coordinate = self.validate_coordinates(coordinate)
            x, y = coordinate

            if action == "mouse_move":
                await self.page.mouse.move(x, y)
                return await self.screenshot()
            elif action == "left_click_drag":
                await self.page.mouse.down(button="left")
                await self.page.mouse.move(x, y)
                await self.page.mouse.up(button="left")
                return await self.screenshot()

        if action in ("key", "type"):
            if text is None:
                raise ToolError(f"text is required for {action}")
            if coordinate is not None:
                raise ToolError(f"coordinate is not accepted for {action}")
            if not isinstance(text, str):
                raise ToolError(output=f"{text} must be a string")

            # Ensure the page is focused before keyboard actions
            await self.page.bring_to_front()

            if action == "key":
                mapped_key = self.map_key(text)
                await self.page.keyboard.press(mapped_key)
                return await self.screenshot()
            elif action == "type":
                results: list[ToolResult] = []
                for chunk in chunks(text, TYPING_GROUP_SIZE):
                    await self.page.keyboard.type(chunk, delay=TYPING_DELAY_MS)
                    results.append(await self.screenshot())
                return ToolResult(
                    output="".join(result.output or "" for result in results),
                    error="".join(result.error or "" for result in results),
                    base64_image=results[-1].base64_image if results else None,
                )

        if action in (
            "left_click",
            "right_click",
            "double_click",
            "middle_click",
            "screenshot",
            "cursor_position",
        ):
            if text is not None:
                raise ToolError(f"text is not accepted for {action}")

            if action == "screenshot":
                return await self.screenshot()
            elif action == "cursor_position":
                # Playwright doesn't provide a direct way to get cursor position
                # We'll return a placeholder since this isn't critical functionality
                return ToolResult(output="Cursor position not available in Playwright")
            else:
                if coordinate is not None:
                    coordinate = self.validate_coordinates(coordinate)
                    x, y = coordinate
                    await self.page.mouse.move(x, y)

                if action == "double_click":
                    await self.page.mouse.dblclick(x, y)
                else:
                    await self.page.mouse.click(x, y, button=MOUSE_BUTTONS[action])
                return await self.screenshot()

        raise ToolError(f"Invalid action: {action}")

    async def screenshot(self):
        """Take a screenshot using Playwright and return the base64 encoded image."""
        if not self.page:
            raise ToolError("Playwright page not initialized")

        # Take screenshot using Playwright and get the buffer directly
        screenshot_bytes = await self.page.screenshot(type="png")
        return ToolResult(base64_image=base64.b64encode(screenshot_bytes).decode())


class ComputerTool20241022(BaseComputerTool, BaseAnthropicTool):
    api_type: Literal["computer_20241022"] = "computer_20241022"

    def to_params(self) -> BetaToolComputerUse20241022Param:
        return {"name": self.name, "type": self.api_type, **self.options}


class ComputerTool20250124(BaseComputerTool, BaseAnthropicTool):
    api_type: Literal["computer_20250124"] = "computer_20250124"

    def to_params(self):
        return cast(
            BetaToolUnionParam,
            {"name": self.name, "type": self.api_type, **self.options},
        )

    async def __call__(
        self,
        *,
        action: Action_20250124,
        text: str | None = None,
        coordinate: tuple[int, int] | list[int] | None = None,
        scroll_direction: ScrollDirection | None = None,
        scroll_amount: int | None = None,
        duration: int | float | None = None,
        key: str | None = None,
        **kwargs,
    ):
        if not self.page:
            raise ToolError("Playwright page not initialized")

        if action in ("left_mouse_down", "left_mouse_up"):
            if coordinate is not None:
                raise ToolError(f"coordinate is not accepted for {action=}.")
            if action == "left_mouse_down":
                await self.page.mouse.down(button="left")
            else:
                await self.page.mouse.up(button="left")
            return await self.screenshot()

        if action == "scroll":
            if scroll_direction is None or scroll_direction not in get_args(
                ScrollDirection
            ):
                raise ToolError(
                    f"{scroll_direction=} must be 'up', 'down', 'left', or 'right'"
                )
            if not isinstance(scroll_amount, int) or scroll_amount < 0:
                raise ToolError(f"{scroll_amount=} must be a non-negative int")

            if coordinate is not None:
                coordinate = self.validate_coordinates(coordinate)
                x, y = coordinate
                await self.page.mouse.move(x, y)

            # Map scroll directions to Playwright's wheel events
            page_dimensions = await self.page.evaluate(
                "() => Promise.resolve({ h: window.innerHeight, w: window.innerWidth })"
            )
            page_partitions = 25
            scroll_factor = scroll_amount / page_partitions
            page_width = page_dimensions["w"]
            page_height = page_dimensions["h"]

            delta_x = 0
            delta_y = 0
            if scroll_direction == "up":
                delta_y = -scroll_factor * page_height
            elif scroll_direction == "down":
                delta_y = scroll_factor * page_height
            elif scroll_direction == "left":
                delta_x = -scroll_factor * page_width
            elif scroll_direction == "right":
                delta_x = scroll_factor * page_width

            print(
                f"Scrolling {abs(delta_x) if delta_x != 0 else abs(delta_y):.02f} pixels {scroll_direction}"
            )

            await self.page.mouse.wheel(delta_x=delta_x, delta_y=delta_y)
            return await self.screenshot()

        if action in ("hold_key", "wait"):
            if duration is None or not isinstance(duration, (int, float)):
                raise ToolError(f"{duration=} must be a number")
            if duration < 0:
                raise ToolError(f"{duration=} must be non-negative")
            if duration > 100:
                raise ToolError(f"{duration=} is too long.")

            if action == "hold_key":
                if text is None:
                    raise ToolError(f"text is required for {action}")
                # Ensure the page is focused before keyboard actions
                await self.page.bring_to_front()
                mapped_key = self.map_key(text)
                await self.page.keyboard.down(mapped_key)
                await asyncio.sleep(duration)
                await self.page.keyboard.up(mapped_key)
                return await self.screenshot()

            if action == "wait":
                await asyncio.sleep(duration)
                return await self.screenshot()

        if action in (
            "left_click",
            "right_click",
            "double_click",
            "triple_click",
            "middle_click",
        ):
            if text is not None:
                raise ToolError(f"text is not accepted for {action}")

            if coordinate is not None:
                coordinate = self.validate_coordinates(coordinate)
                x, y = coordinate
                await self.page.mouse.move(x, y)

            if key:
                mapped_key = self.map_key(key)
                await self.page.keyboard.down(mapped_key)

            if action == "triple_click":
                # Playwright doesn't have triple click, so we'll simulate it
                await self.page.mouse.click(x, y, click_count=3)
            elif action == "double_click":
                await self.page.mouse.dblclick(x, y)
            else:
                await self.page.mouse.click(x, y, button=MOUSE_BUTTONS[action])

            if key:
                await self.page.keyboard.up(mapped_key)

            return await self.screenshot()

        return await super().__call__(
            action=action, text=text, coordinate=coordinate, key=key, **kwargs
        )
