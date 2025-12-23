"""
Work with Frames

Demonstrates interacting with iframes:
- frame_locator() for simple frame access
- content_frame() for lower-level control
"""

from playwright.async_api import Page
from typing import TypedDict


class Params(TypedDict):
    pass


async def automation(page: Page, params: Params | None = None, **_kwargs):
    # Using a page with multiple frames
    await page.goto("https://the-internet.herokuapp.com/nested_frames")
    await page.wait_for_load_state("load")

    # Method 1: Using frame_locator() - recommended for most cases
    # Access content inside nested frames
    top_frame = page.frame_locator('frame[name="frame-top"]')

    left_content = await top_frame.frame_locator('frame[name="frame-left"]').locator("body").text_content()
    middle_content = await top_frame.frame_locator('frame[name="frame-middle"]').locator("body").text_content()
    right_content = await top_frame.frame_locator('frame[name="frame-right"]').locator("body").text_content()

    bottom_frame = page.frame_locator('frame[name="frame-bottom"]')
    bottom_content = await bottom_frame.locator("body").text_content()

    # Method 2: Using content_frame() for more control
    await page.goto("https://the-internet.herokuapp.com/iframe")
    await page.wait_for_load_state("load")

    iframe_element = await page.wait_for_selector("#mce_0_ifr")
    frame = await iframe_element.content_frame()

    frame_title = ""
    if frame:
        # Now we can interact with the frame content
        editor_body = frame.locator("#tinymce")
        frame_title = await editor_body.text_content() if await editor_body.count() > 0 else ""

    return {
        "frames": {
            "left": left_content.strip() if left_content else None,
            "middle": middle_content.strip() if middle_content else None,
            "right": right_content.strip() if right_content else None,
            "bottom": bottom_content.strip() if bottom_content else None,
        },
        "frameTitle": frame_title.strip() if frame_title else "",
    }
