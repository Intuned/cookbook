"""
Agentic sampling loop that calls the Anthropic API and local implementation of anthropic-defined computer use tools.
From https://github.com/anthropics/anthropic-quickstarts/blob/main/computer-use-demo/computer_use_demo/loop.py
"""

import os
from datetime import datetime
from enum import StrEnum
from typing import Any, cast

from anthropic import (
    Anthropic,
)
from anthropic.types.beta import (
    BetaCacheControlEphemeralParam,
    BetaContentBlockParam,
    BetaImageBlockParam,
    BetaMessage,
    BetaMessageParam,
    BetaTextBlockParam,
    BetaToolResultBlockParam,
    BetaToolUseBlockParam,
)
from lib.anthropic.tools import (
    TOOL_GROUPS_BY_VERSION,
    ToolCollection,
    ToolResult,
    ToolVersion,
)
from playwright.async_api import Page

PROMPT_CACHING_BETA_FLAG = "prompt-caching-2024-07-31"


class APIProvider(StrEnum):
    ANTHROPIC = "anthropic"


# This system prompt is optimized for the Docker environment in this repository and
# specific tool combinations enabled.
# We encourage modifying this system prompt to ensure the model has context for the
# environment it is running in, and to provide any additional information that may be
# helpful for the task at hand.
SYSTEM_PROMPT = f"""<SYSTEM_CAPABILITY>
* You are utilising an Ubuntu virtual machine using {os.uname().machine} architecture with internet access.
* When you connect to the display, CHROMIUM IS ALREADY OPEN.
* To navigate to a website, USE THE BROWSER TOOL with the URL. This is much more reliable than manually typing URLs.
* Example: Use browser tool with url="intunedhq.com" to go directly to that site.
* When viewing a page it can be helpful to zoom out so that you can see everything on the page.
* Either that, or make sure you scroll down to see everything before deciding something isn't available.
* When using your computer function calls, they take a while to run and send back to you.
* Where possible/feasible, try to chain multiple of these calls all into one function calls request.
* The current date is {datetime.now().strftime("%A, %B %d, %Y")}.
* After each step, take a screenshot and carefully evaluate if you have achieved the right outcome.
* Explicitly show your thinking: "I have evaluated step X..." If not correct, try again.
* Only when you confirm a step was executed correctly should you move on to the next one.
</SYSTEM_CAPABILITY>

<IMPORTANT>
* ALWAYS use the browser tool to navigate to URLs instead of trying to type them manually.
* The browser tool is the most reliable way to navigate to websites.
</IMPORTANT>"""


async def sampling_loop(
    *,
    model: str,
    messages: list[BetaMessageParam],
    api_key: str,
    base_url: str | None = None,
    provider: APIProvider = APIProvider.ANTHROPIC,
    system_prompt_suffix: str = "",
    only_n_most_recent_images: int | None = None,
    max_tokens: int = 4096,
    tool_version: ToolVersion = "computer_use_20250124",
    thinking_budget: int | None = None,
    token_efficient_tools_beta: bool = False,
    playwright_page: Page,
    max_iterations: int = 50,
):
    """
    Agentic sampling loop for the assistant/tool interaction of computer use.

    Args:
        model: The model to use for the API call
        messages: The conversation history
        api_key: The API key for authentication
        provider: The API provider (defaults to ANTHROPIC)
        system_prompt_suffix: Additional system prompt text (defaults to empty string)
        only_n_most_recent_images: Optional limit on number of recent images to keep
        max_tokens: Maximum tokens for the response (defaults to 4096)
        tool_version: Version of tools to use (defaults to V20250124)
        thinking_budget: Optional token budget for thinking
        token_efficient_tools_beta: Whether to use token efficient tools beta
        playwright_page: The Playwright page instance for browser automation
        max_iterations: Maximum number of loop iterations before stopping (defaults to 50)
    """
    tool_group = TOOL_GROUPS_BY_VERSION[tool_version]
    tool_collection = ToolCollection(
        *(
            ToolCls(
                page=playwright_page
                if ToolCls.__name__
                in ("ComputerTool20241022", "ComputerTool20250124", "BrowserTool")
                else None
            )
            for ToolCls in tool_group.tools
        )
    )
    system = BetaTextBlockParam(
        type="text",
        text=f"{SYSTEM_PROMPT}{' ' + system_prompt_suffix if system_prompt_suffix else ''}",
    )

    iteration = 0
    while True:
        iteration += 1
        if iteration > max_iterations:
            print(f"Maximum iterations ({max_iterations}) reached, ending loop")
            return messages
        enable_prompt_caching = False
        betas = [tool_group.beta_flag] if tool_group.beta_flag else []
        if token_efficient_tools_beta:
            betas.append("token-efficient-tools-2025-02-19")
        image_truncation_threshold = only_n_most_recent_images or 0
        client = Anthropic(api_key=api_key, base_url=base_url, max_retries=4)
        enable_prompt_caching = True

        if enable_prompt_caching:
            betas.append(PROMPT_CACHING_BETA_FLAG)
            _inject_prompt_caching(messages)
            # Because cached reads are 10% of the price, we don't think it's
            # ever sensible to break the cache by truncating images
            only_n_most_recent_images = 0
            # Use type ignore to bypass TypedDict check until SDK types are updated
            system["cache_control"] = {"type": "ephemeral"}  # type: ignore

        if only_n_most_recent_images:
            _maybe_filter_to_n_most_recent_images(
                messages,
                only_n_most_recent_images,
                min_removal_threshold=image_truncation_threshold,
            )
        extra_body = {}
        if thinking_budget:
            # Ensure we only send the required fields for thinking
            extra_body = {
                "thinking": {"type": "enabled", "budget_tokens": thinking_budget}
            }

        # Call the API
        response = client.beta.messages.create(
            max_tokens=max_tokens,
            messages=messages,
            model=model,
            system=[system],
            tools=tool_collection.to_params(),
            betas=betas,
            extra_body=extra_body,
        )

        response_params = _response_to_params(response)
        messages.append(
            {
                "role": "assistant",
                "content": response_params,
            }
        )

        loggable_content = [
            {
                "text": block.get("text", "") or block.get("thinking", ""),
                "input": block.get("input", ""),
            }
            for block in response_params
        ]
        print("=== LLM RESPONSE ===")
        print("Stop reason:", response.stop_reason)
        print(loggable_content)
        print("===")

        if response.stop_reason == "end_turn":
            print("LLM has completed its task, ending loop")
            return messages

        tool_result_content: list[BetaToolResultBlockParam] = []
        for content_block in response_params:
            if content_block["type"] == "tool_use":
                result = await tool_collection.run(
                    name=content_block["name"],
                    tool_input=cast(dict[str, Any], content_block["input"]),
                )
                tool_result_content.append(
                    _make_api_tool_result(result, content_block["id"])
                )

        if not tool_result_content:
            return messages

        messages.append({"content": tool_result_content, "role": "user"})


def _maybe_filter_to_n_most_recent_images(
    messages: list[BetaMessageParam],
    images_to_keep: int,
    min_removal_threshold: int,
):
    """
    With the assumption that images are screenshots that are of diminishing value as
    the conversation progresses, remove all but the final `images_to_keep` tool_result
    images in place, with a chunk of min_removal_threshold to reduce the amount we
    break the implicit prompt cache.
    """
    if images_to_keep is None:
        return messages

    tool_result_blocks = cast(
        list[BetaToolResultBlockParam],
        [
            item
            for message in messages
            for item in (
                message["content"] if isinstance(message["content"], list) else []
            )
            if isinstance(item, dict) and item.get("type") == "tool_result"
        ],
    )

    total_images = sum(
        1
        for tool_result in tool_result_blocks
        for content in tool_result.get("content", [])
        if isinstance(content, dict) and content.get("type") == "image"
    )

    images_to_remove = total_images - images_to_keep
    # for better cache behavior, we want to remove in chunks
    images_to_remove -= images_to_remove % min_removal_threshold

    for tool_result in tool_result_blocks:
        if isinstance(tool_result.get("content"), list):
            new_content = []
            for content in tool_result.get("content", []):
                if isinstance(content, dict) and content.get("type") == "image":
                    if images_to_remove > 0:
                        images_to_remove -= 1
                        continue
                new_content.append(content)
            tool_result["content"] = new_content


def _response_to_params(
    response: BetaMessage,
) -> list[BetaContentBlockParam]:
    res: list[BetaContentBlockParam] = []
    for block in response.content:
        block_dict = block.model_dump()
        block_type = block_dict.get("type")

        if block_type == "text":
            if block_dict.get("text"):
                res.append(BetaTextBlockParam(type="text", text=block_dict["text"]))
        elif block_type == "thinking":
            # Handle thinking blocks - include signature field
            thinking_block = {
                "type": "thinking",
                "thinking": block_dict.get("thinking"),
            }
            if "signature" in block_dict:
                thinking_block["signature"] = block_dict["signature"]
            res.append(cast(BetaContentBlockParam, thinking_block))
        elif block_type == "tool_use":
            # Handle tool use blocks - only include required fields to avoid 'caller' error
            res.append(
                cast(
                    BetaToolUseBlockParam,
                    {
                        "type": "tool_use",
                        "id": block_dict["id"],
                        "name": block_dict["name"],
                        "input": block_dict["input"],
                    },
                )
            )
    return res


def _inject_prompt_caching(
    messages: list[BetaMessageParam],
):
    """
    Set cache breakpoints for the 3 most recent turns
    one cache breakpoint is left for tools/system prompt, to be shared across sessions
    """

    breakpoints_remaining = 3
    for message in reversed(messages):
        if message["role"] == "user" and isinstance(
            content := message["content"], list
        ):
            if breakpoints_remaining:
                breakpoints_remaining -= 1
                # Use type ignore to bypass TypedDict check until SDK types are updated
                content[-1]["cache_control"] = BetaCacheControlEphemeralParam(  # type: ignore
                    {"type": "ephemeral"}
                )
            else:
                content[-1].pop("cache_control", None)
                # we'll only every have one extra turn per loop
                break


def _make_api_tool_result(
    result: ToolResult, tool_use_id: str
) -> BetaToolResultBlockParam:
    """Convert an agent ToolResult to an API ToolResultBlockParam."""
    tool_result_content: list[BetaTextBlockParam | BetaImageBlockParam] | str = []
    is_error = False
    if result.error:
        is_error = True
        tool_result_content = _maybe_prepend_system_tool_result(result, result.error)
    else:
        if result.output:
            tool_result_content.append(
                {
                    "type": "text",
                    "text": _maybe_prepend_system_tool_result(result, result.output),
                }
            )
        if result.base64_image:
            tool_result_content.append(
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": "image/png",
                        "data": result.base64_image,
                    },
                }
            )
    return {
        "type": "tool_result",
        "content": tool_result_content,
        "tool_use_id": tool_use_id,
        "is_error": is_error,
    }


def _maybe_prepend_system_tool_result(result: ToolResult, result_text: str):
    if result.system:
        result_text = f"<system>{result.system}</system>\n{result_text}"
    return result_text
