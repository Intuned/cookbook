"""
Browser navigation tool using Playwright.
"""

import base64
from typing import Literal
from playwright.async_api import Page
from intuned_browser import go_to_url

from anthropic.types.beta import BetaToolUnionParam

from .base import BaseAnthropicTool, ToolError, ToolResult


class BrowserTool(BaseAnthropicTool):
    """
    A tool that allows the agent to navigate to URLs using the browser.
    """

    name: Literal["browser"] = "browser"
    api_type: Literal["custom"] = "custom"
    page: Page | None = None

    def __init__(self, page: Page | None = None):
        super().__init__()
        self.page = page

    def to_params(self) -> BetaToolUnionParam:
        return {
            "type": "custom",
            "name": self.name,
            "description": "Navigate to a URL in the browser. Use this tool to go to websites directly instead of manually typing URLs.",
            "input_schema": {
                "type": "object",
                "properties": {
                    "url": {
                        "type": "string",
                        "description": "The URL to navigate to. Include the protocol (http:// or https://) if needed, otherwise it will be added automatically.",
                    }
                },
                "required": ["url"],
            },
        }

    async def __call__(
        self,
        *,
        url: str,
        **kwargs,
    ) -> ToolResult:
        if not self.page:
            raise ToolError("Playwright page not initialized")

        if not url:
            raise ToolError("URL is required")

        # Add https:// if no protocol is specified
        if not url.startswith(("http://", "https://")):
            url = f"https://{url}"

        try:
            # Navigate to the URL
            await go_to_url(page=self.page, url=url)
            
            # Wait a bit for the page to render
            await self.page.wait_for_timeout(2000)
            response = None  # go_to_url doesn't return a response object
            
            # Take a screenshot
            screenshot_bytes = await self.page.screenshot(type="png")
            
            status_text = "success" if response and response.ok else "failed"
            output = f"Navigated to {url} - Status: {status_text}"
            
            return ToolResult(
                output=output,
                base64_image=base64.b64encode(screenshot_bytes).decode()
            )
        except Exception as e:
            raise ToolError(f"Failed to navigate to {url}: {str(e)}")

