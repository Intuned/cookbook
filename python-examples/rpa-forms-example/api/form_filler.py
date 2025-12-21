from typing import TypedDict, cast
from intuned_runtime import attempt_store
from pydantic import BaseModel
from stagehand import Stagehand, StagehandPage
from stagehand.types import ObserveResult
import os
from utils.types_and_schemas import ListParameters


class Params(TypedDict):
    criteria: str


action_cache = {}


async def get_cached_action(page: StagehandPage, instruction: str):
    if instruction in action_cache:
        print(f"Using cached action for {instruction}")
        return action_cache[instruction]

    results = await page.observe(instruction)
    if results:
        action = results[0]
        action_cache[instruction] = action
        return action

    return None


async def perform_action(
    page: StagehandPage, action: ObserveResult | str, instruction: str | None = None
):
    if action:
        try:
            await page.act(action)
            await page._wait_for_settled_dom()
        except Exception:
            # If action failed and we have the instruction, clear cache and re-observe
            if instruction and instruction in action_cache:
                print(
                    f"Action failed for '{instruction}', clearing cache and re-observing..."
                )
                del action_cache[instruction]
                results = await page.observe(instruction)
                if results:
                    new_action = results[0]
                    action_cache[instruction] = new_action
                    await page.act(new_action)
                    await page._wait_for_settled_dom()
                else:
                    raise
            else:
                raise


async def get_and_perform_action(page: StagehandPage, instruction: str):
    """Get cached or observe action, then perform it with self-healing on failure."""
    action = await get_cached_action(page, instruction)
    if action:
        await perform_action(page, action, instruction)
    else:
        raise ValueError(f"Could not find action for instruction: {instruction}")


# async def automation(
#     page: StagehandPage, params: ListParameters, *args: ..., **kwargs: ...
# ):
#     await page.set_viewport_size({"width": 1280, "height": 800})
#     params = ListParameters.model_validate(params)
#     site = params.metadata.site
#     insurance_object_type = params.metadata.insurance_object_type
#     zip_code = params.address.zip_code
#     # stagehand = cast(Stagehand, attempt_store.get("stagehand"))

#     await page.goto(site)

#     # agent = stagehand.agent(
#     #     provider="openai",
#     #     model="computer-use-preview",
#     #     options={"apiKey": os.getenv("OPENAI_API_KEY")},
#     # )

#     # Agent runs on current Stagehand page
#     await get_and_perform_action(
#         page, f"Fill in the zip code {zip_code} in the zip code field"
#     )
#     await page.act(f"click on the {insurance_object_type} option")
#     await get_and_perform_action(page, "Click the Start My Quote button")
#     await get_and_perform_action(
#         page, f"Fill in the zip code {zip_code} in the zip code field again"
#     )
#     await get_and_perform_action(page, "Click the Continue button")
#     await get_and_perform_action(
#         page,
#         f"Fill in the date of birth {params.applicant.date_of_birth} in the date of birth field",
#     )
#     await get_and_perform_action(page, "Click the Next button")
#     await get_and_perform_action(
#         page,
#         f"Fill in the first name {params.applicant.first_name} in the first name field",
#     )
#     await get_and_perform_action(
#         page,
#         f"Fill in the last name {params.applicant.last_name} in the last name field",
#     )
#     await get_and_perform_action(page, "Click the Next button")
#     # fill_address_action = await get_cached_action(
#     #     page,
#     #     f"""Type {params.address.street_line1} into the Address field.
#     #     Wait for the address suggestions dropdown to appear.""",
#     # )
#     # await perform_action(page, cast(ObserveResult, fill_address_action))
#     # await page._wait_for_settled_dom()
#     # fill_apt_action = await get_cached_action(
#     #     page,
#     #     f"""Fill {params.address.street_line2} into the Apt # field.""",
#     # )
#     # await perform_action(page, cast(ObserveResult, fill_apt_action))
#     # await page._wait_for_settled_dom()
#     # click_next_action = await get_cached_action(page, "Click the Next button")
#     # await perform_action(page, cast(ObserveResult, click_next_action))
#     # await page._wait_for_settled_dom()
#     # if params.vehicle.has_vin:
#     #     check_vin_action = await get_cached_action(page, "Click the Yes button")
#     #     await perform_action(page, cast(ObserveResult, check_vin_action))
#     #     await page._wait_for_settled_dom()
#     #     fill_vin_action = await get_cached_action(
#     #         page,
#     #         f"""Fill {params.vehicle.vin} into the VIN field.""",
#     #     )
#     #     await perform_action(page, cast(ObserveResult, fill_vin_action))
#     #     await page._wait_for_settled_dom()
#     # else:
#     #     check_vin_action = await get_cached_action(page, "Click the No button")
#     #     await perform_action(page, cast(ObserveResult, check_vin_action))
#     #     await page._wait_for_settled_dom()
#     #     fill_year_action = await get_cached_action(
#     #         page,
#     #         f"""Fill {params.vehicle.year} into the Year field.""",
#     #     )
#     #     await perform_action(page, cast(ObserveResult, fill_year_action))
#     #     await page._wait_for_settled_dom()
#     #     fill_make_action = await get_cached_action(
#     #         page,
#     #         f"""Fill {params.vehicle.make} into the Make field.""",
#     #     )
#     #     await perform_action(page, cast(ObserveResult, fill_make_action))
#     #     await page._wait_for_settled_dom()
#     #     fill_model_action = await get_cached_action(
#     #         page,
#     #         f"""Fill {params.vehicle.model} into the Model field.""",
#     #     )
#     #     await perform_action(page, cast(ObserveResult, fill_model_action))
#     #     await page._wait_for_settled_dom()
#     return await page.extract("Extract the title of the page")


async def automation(
    page: StagehandPage, params: ListParameters, *args: ..., **kwargs: ...
):
    await page.set_viewport_size({"width": 1280, "height": 800})

    params = ListParameters.model_validate(params)

    site = params.metadata.site
    insurance_object_type = params.metadata.insurance_object_type
    zip_code = params.address.zip_code

    await page.goto(site)

    # --- ZIP entry ---
    await get_and_perform_action(
        page, f"Fill in the zip code {zip_code} in the zip code field"
    )

    # --- Object type selection ---
    await get_and_perform_action(page, f"Click on the {insurance_object_type} option")

    await get_and_perform_action(page, "Click the Start My Quote button")

    # --- ZIP confirmation (GEICO repeats this) ---
    await get_and_perform_action(
        page, f"Fill in the zip code {zip_code} in the zip code field again"
    )
    await get_and_perform_action(page, "Click the Continue button")

    # --- DOB ---
    await get_and_perform_action(
        page,
        f"Fill in the date of birth {params.applicant.date_of_birth} in the date of birth field",
    )
    await get_and_perform_action(page, "Click the Next button")

    # --- Name ---
    await get_and_perform_action(
        page,
        f"Fill in the first name {params.applicant.first_name} in the first name field",
    )
    await get_and_perform_action(
        page,
        f"Fill in the last name {params.applicant.last_name} in the last name field",
    )
    await get_and_perform_action(page, "Click the Next button")

    # --- Address (autocomplete + apt split) ---
    await get_and_perform_action(
        page,
        f"""
        Type {params.address.street_line1}
        into the Address field.
        Wait for the address suggestions dropdown to appear.
        Select the first suggested address.
        """,
    )

    if params.address.street_line2:
        await get_and_perform_action(
            page,
            f"Fill {params.address.street_line2} into the Apt # field",
        )

    await get_and_perform_action(page, "Click the Next button")

    # --- VIN decision ---
    if params.vehicle.has_vin:
        await get_and_perform_action(page, "Click the Yes button")
        await get_and_perform_action(
            page, f"Fill {params.vehicle.vin} into the VIN field"
        )
    else:
        await get_and_perform_action(page, "Click the No button")
        await get_and_perform_action(
            page, f"Fill {params.vehicle.year} into the Year field"
        )
        await get_and_perform_action(
            page, f"Fill {params.vehicle.make} into the Make field"
        )
        await get_and_perform_action(
            page, f"Fill {params.vehicle.model} into the Model field"
        )

    return await page.extract("Extract the title of the page")


"""
{
  "metadata": {
    "site": "https://www.geico.com",
    "insurance_object_type": "auto"
  },
  "applicant": {
    "first_name": "John",
    "last_name": "Doe",
    "date_of_birth": "04/12/1992",
    "gender": "male",
    "marital_status": "single"
  },
  "address": {
    "street_line1": "123 W 34th St, Savannah, GA 31401",
    "street_line2": "5B",
    "city": "Savannah",
    "state": "GA",
    "zip_code": "31401",
    "residence_type": "apartment"
  },
  "vehicle": {
    "has_vin": false,
    "vin": null,
    "year": 2021,
    "make": "Toyota",
    "model": "Camry",
    "ownership": "owned"
  }
}

"""
