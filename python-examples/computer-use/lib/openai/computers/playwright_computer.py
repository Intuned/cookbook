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


def _map_keys(keys: list[str] | None) -> list[str]:
    return [CUA_KEY_TO_PLAYWRIGHT_KEY.get(k.lower(), k) for k in (keys or [])]


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
    async def screenshot(self, **_kwargs) -> str:
        """Capture only the viewport (not full_page)."""
        print("📸 Taking screenshot...")
        png_bytes = await self._page.screenshot(full_page=False)
        return base64.b64encode(png_bytes).decode("utf-8")

    async def click(
        self,
        x: int,
        y: int,
        button: str = "left",
        keys: list[str] | None = None,
        **_kwargs,
    ) -> None:
        if button == "back":
            await self.back()
        elif button == "forward":
            await self.forward()
        elif button == "wheel":
            await self._page.mouse.wheel(x, y)
        else:
            print(f"🖱️  Click at ({x}, {y})")
            button_type: Literal["left", "right"] = (
                "right" if button == "right" else "left"
            )
            mapped_keys = _map_keys(keys)
            for key in mapped_keys:
                await self._page.keyboard.down(key)
            await self._page.mouse.click(x, y, button=button_type)
            for key in reversed(mapped_keys):
                await self._page.keyboard.up(key)

    async def double_click(self, x: int, y: int, **_kwargs) -> None:
        await self._page.mouse.dblclick(x, y)

    async def scroll(
        self, x: int, y: int, scroll_x: int, scroll_y: int, **_kwargs
    ) -> None:
        direction = "⬇️ down" if scroll_y > 0 else "⬆️ up" if scroll_y < 0 else "↔️"
        print(f"📜 Scroll {direction} ({scroll_x}, {scroll_y})")
        await self._page.mouse.move(x, y)
        await self._page.evaluate(f"window.scrollBy({scroll_x}, {scroll_y})")

    async def type(self, text: str, **_kwargs) -> None:
        print(f"⌨️  Typing: {text}")
        await self._page.keyboard.type(text)

    async def wait(self, ms: int = 1000, **_kwargs) -> None:
        await asyncio.sleep(ms / 1000)

    async def move(self, x: int, y: int, **_kwargs) -> None:
        await self._page.mouse.move(x, y)

    async def keypress(self, keys: list[str], **_kwargs) -> None:
        mapped_keys = _map_keys(keys)
        for key in mapped_keys:
            await self._page.keyboard.down(key)
        for key in reversed(mapped_keys):
            await self._page.keyboard.up(key)

    async def drag(self, path: list[dict[str, int]], **_kwargs) -> None:
        if not path:
            return
        await self._page.mouse.move(path[0]["x"], path[0]["y"])
        await self._page.mouse.down()
        for point in path[1:]:
            await self._page.mouse.move(point["x"], point["y"])
        await self._page.mouse.up()

    # --- Extra browser-oriented actions ---
    async def goto(self, url: str, **_kwargs) -> None:
        print(f"🌐 Navigating to: {url}")
        try:
            await go_to_url(page=self._page, url=url)
            print(f"✅ Successfully loaded: {url}")
        except Exception as e:
            print(f"❌ Error navigating to {url}: {e}")

    async def back(self, **_kwargs) -> None:
        await self._page.go_back()

    async def forward(self, **_kwargs) -> None:
        await self._page.go_forward()
