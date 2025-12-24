# https://docs.intunedhq.com/automation-sdks/intuned-sdk/python/helpers/functions/filter_empty_values
from playwright.async_api import Page
from typing import TypedDict
from intuned_browser import filter_empty_values
# from intuned_runtime import extend_payload


class Params(TypedDict):
    pass


async def automation(page: Page, params: Params | None = None, **_kwargs):
    # Filter empty values from dictionary
    result1 = filter_empty_values({"a": "", "b": "hello", "c": None})
    print("Result of filtering empty values from dictionary:")
    print(result1)
    # Filter empty values from list
    result2 = filter_empty_values([1, "", None, [2, ""]])
    print("Result of filtering empty values from list:")
    print(result2)
    # Filter nested structures
    result3 = filter_empty_values({"users": [{"name": ""}, {"name": "John"}]})
    print("Result of filtering nested structures:")
    print(result3)
    return result1, result2, result3