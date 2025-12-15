from playwright.async_api import Page, Locator
from typing import List, Optional


async def get_text(locator: Locator) -> str:
    """
    Get visible text from an element.
    Returns empty string if nothing found.
    """
    await locator.wait_for(state="visible")
    text = await locator.text_content()
    return text.strip() if text else ""


async def get_value(locator: Locator) -> str:
    """
    Get value from input/textarea element.
    Returns empty string if nothing found.
    """
    await locator.wait_for(state="attached")
    value = await locator.input_value()
    return value.strip() if value else ""


async def get_attribute(locator: Locator, name: str) -> Optional[str]:
    """
    Get attribute value of an element.
    Returns None if attribute does not exist.
    """
    await locator.wait_for(state="attached")
    return await locator.get_attribute(name)


async def get_text_list(locator: Locator) -> List[str]:
    """
    Scrape all elements matching locator and return text list.
    """
    await locator.first.wait_for(state="visible")
    results: List[str] = []
    count = await locator.count()

    for i in range(count):
        text = await locator.nth(i).text_content()
        if text:
            results.append(text.strip())

    return results


async def get_attribute_list(locator: Locator, name: str) -> List[str]:
    """
    Scrape all elements matching locator and return attribute list.
    """
    await locator.first.wait_for(state="attached")
    results: List[str] = []
    count = await locator.count()

    for i in range(count):
        attr = await locator.nth(i).get_attribute(name)
        if attr:
            results.append(attr.strip())

    return results
