# https://docs.intunedhq.com/automation-sdks/intuned-sdk/python/helpers/functions/process_date
from typing import TypedDict

from intuned_browser import process_date
from playwright.async_api import Page

# from intuned_runtime import extend_payload


class Params(TypedDict):
    pass


async def automation(page: Page, params: Params | None = None, **_kwargs):
    # Basic date string
    date1 = process_date("22/11/2024")
    print("Result of processing 22/11/2024:")
    print(date1)  # 2024-11-22 00:00:00

    # Single-digit variant
    date2 = process_date("8/16/2019")
    print("Result of processing 8/16/2019:")
    print(date2)  # 2019-08-16 00:00:00

    # Date with time (time is ignored)
    date3 = process_date("12/09/2024 9:00 AM")
    print("Result of processing 12/09/2024 9:00 AM:")
    print(date3)  # 2024-12-09 00:00:00

    # With timezone
    date4 = process_date("10/23/2024 12:06 PM CST")
    print("Result of processing 10/23/2024 12:06 PM CST:")
    print(date4)  # 2024-10-23 00:00:00

    # Full month format
    date5 = process_date("November 14, 2024")
    print("Result of processing November 14, 2024:")
    print(date5)  # 2024-11-14 00:00:00

    return {
        "date1": str(date1),
        "date2": str(date2),
        "date3": str(date3),
        "date4": str(date4),
        "date5": str(date5),
    }
