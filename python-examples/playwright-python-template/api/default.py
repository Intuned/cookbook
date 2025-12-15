from playwright.async_api import Page
from typing import TypedDict
from playwright.async_api import Page
from examples.scrape_list import scrape_list
from examples.submit_form import submit_form
# from intuned_runtime import extend_payload


class Params(TypedDict):
    pass


async def automation(page: Page, params: Params | None = None, **_kwargs):
    # ----------------------------Scrape A List----------------------------
    # list_of_items = await scrape_list(page, "https://sandbox.intuned.dev/lists/table/")
    # print("Scraped A List: ", list_of_items)

    # ----------------------------Submit A Form ----------------------------
    is_submitted = await submit_form(
        page, "https://demoqa.com/automation-practice-form"
    )
    print("Submitted  successfully!") if is_submitted else print("Failed")

    return {}
