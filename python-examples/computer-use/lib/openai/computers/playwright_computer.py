import asyncio
import base64
from typing import Literal

from intuned_browser import go_to_url
from playwright.async_api import Page

# Key mapping for CUA style keys
CUA_KEY_TO_PLAYWRIGHT_KEY = {
    "/": "Divide",
    "\\": "Backslash",
    "alt": "Alt",
    "arrowdown": "ArrowDown",
    "arrowleft": "ArrowLeft",
    "arrowright": "ArrowRight",
    "arrowup": "ArrowUp",
    "backspace": "Backspace",
    "capslock": "CapsLock",
    "cmd": "Meta",
    "ctrl": "Control",
    "delete": "Delete",
    "end": "End",
    "enter": "Enter",
    "esc": "Escape",
    "home": "Home",
    "insert": "Insert",
    "option": "Alt",
    "pagedown": "PageDown",
    "pageup": "PageUp",
    "shift": "Shift",
    "space": " ",
    "super": "Meta",
    "tab": "Tab",
    "win": "Meta",
}


class PlaywrightComputer:
    """
    Async Playwright-based computer implementation that uses a provided Page object.
    """

    def __init__(self, page: Page):
        self._page = page

    def get_environment(self) -> Literal["browser"]:
        return "browser"

    def get_dimensions(self) -> tuple[int, int]:
        return (1280, 720)

    async def get_current_url(self) -> str:
        return self._page.url

    # --- Common "Computer" actions ---
    async def screenshot(self) -> str:
        """Capture only the viewport (not full_page)."""
        print("📸 Taking screenshot...")
        png_bytes = await self._page.screenshot(full_page=False)
        return base64.b64encode(png_bytes).decode("utf-8")

    async def click(self, x: int, y: int, button: str = "left") -> None:
        if button == "back":
            await self.back()
        elif button == "forward":
            await self.forward()
        elif button == "wheel":
            await self._page.mouse.wheel(x, y)
        else:
            print(f"🖱️  Click at ({x}, {y})")
            button_mapping = {"left": "left", "right": "right"}
            button_type = button_mapping.get(button, "left")
            await self._page.mouse.click(x, y, button=button_type)

    async def double_click(self, x: int, y: int) -> None:
        await self._page.mouse.dblclick(x, y)

    async def scroll(self, x: int, y: int, scroll_x: int, scroll_y: int) -> None:
        direction = "⬇️ down" if scroll_y > 0 else "⬆️ up" if scroll_y < 0 else "↔️"
        print(f"📜 Scroll {direction} ({scroll_x}, {scroll_y})")
        await self._page.mouse.move(x, y)
        await self._page.evaluate(f"window.scrollBy({scroll_x}, {scroll_y})")

    async def type(self, text: str) -> None:
        print(f"⌨️  Typing: {text}")
        await self._page.keyboard.type(text)

    async def wait(self, ms: int = 1000) -> None:
        await asyncio.sleep(ms / 1000)

    async def move(self, x: int, y: int) -> None:
        await self._page.mouse.move(x, y)

    async def keypress(self, keys: list[str]) -> None:
        mapped_keys = [CUA_KEY_TO_PLAYWRIGHT_KEY.get(key.lower(), key) for key in keys]
        for key in mapped_keys:
            await self._page.keyboard.down(key)
        for key in reversed(mapped_keys):
            await self._page.keyboard.up(key)

    async def drag(self, path: list[dict[str, int]]) -> None:
        if not path:
            return
        await self._page.mouse.move(path[0]["x"], path[0]["y"])
        await self._page.mouse.down()
        for point in path[1:]:
            await self._page.mouse.move(point["x"], point["y"])
        await self._page.mouse.up()

    # --- Extra browser-oriented actions ---
    async def goto(self, url: str) -> None:
        print(f"🌐 Navigating to: {url}")
        try:
            await go_to_url(page=self._page, url=url)
            print(f"✅ Successfully loaded: {url}")
        except Exception as e:
            print(f"❌ Error navigating to {url}: {e}")

    async def back(self) -> None:
        await self._page.go_back()

    async def forward(self) -> None:
        await self._page.go_forward()
