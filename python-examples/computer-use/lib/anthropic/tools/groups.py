"""
From https://github.com/anthropics/anthropic-quickstarts/blob/main/computer-use-demo/computer_use_demo/tools/groups.py
"""

from dataclasses import dataclass
from typing import Literal

from .base import BaseAnthropicTool
from .browser import BrowserTool
from .computer import ComputerTool20241022, ComputerTool20250124

ToolVersion = Literal[
    "computer_use_20250124", "computer_use_20241022", "computer_use_20250429"
]
BetaFlag = Literal[
    "computer-use-2024-10-22", "computer-use-2025-01-24", "computer-use-2025-04-29"
]


@dataclass(frozen=True, kw_only=True)
class ToolGroup:
    version: ToolVersion
    tools: list[type[BaseAnthropicTool]]
    beta_flag: BetaFlag | None = None


TOOL_GROUPS: list[ToolGroup] = [
    ToolGroup(
        version="computer_use_20241022",
        tools=[ComputerTool20241022, BrowserTool],
        beta_flag="computer-use-2024-10-22",
    ),
    ToolGroup(
        version="computer_use_20250124",
        tools=[ComputerTool20250124, BrowserTool],
        beta_flag="computer-use-2025-01-24",
    ),
    ToolGroup(
        version="computer_use_20250429",
        tools=[ComputerTool20250124, BrowserTool],
        beta_flag="computer-use-2025-01-24",
    ),
]

TOOL_GROUPS_BY_VERSION = {tool_group.version: tool_group for tool_group in TOOL_GROUPS}
