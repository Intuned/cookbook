from stagehand import StagehandPage
from utils.types_and_schemas import ListParameters


class InvalidActionError(Exception):
    pass


async def perform_action(page: StagehandPage, instruction: str) -> None:
    action = await page.observe(instruction)
    if action:
        await page.act(action[0])
        await page.wait_for_load_state("domcontentloaded")
        await page.wait_for_timeout(2000)
    else:
        raise InvalidActionError(
            f"Could not find action for instruction: {instruction}"
        )


async def automation(
    page: StagehandPage, params: ListParameters, *args: ..., **kwargs: ...
):
    await page.set_viewport_size({"width": 1280, "height": 800})

    params = ListParameters.model_validate(params)

    site = params.metadata.site
    await page.goto(site)

    # --- Object type selection ---
    await perform_action(
        page,
        f"Choose the {params.metadata.insurance_type} option from the insurance type dropdown",
    )

    # --- ZIP entry ---
    await perform_action(
        page, f"Fill in the zip code {params.address.zip_code} in the zip code field"
    )

    await perform_action(page, "Click the Get a quote button")
    await page.wait_for_selector("#mainContent")
    # --- Name ---
    await perform_action(
        page,
        f"Fill in the first name {params.applicant.first_name} in the first name field",
    )
    await perform_action(
        page,
        f"Fill in the last name {params.applicant.last_name} in the last name field",
    )
    # --- DOB ---
    await perform_action(
        page,
        f"Fill in the date of birth {params.applicant.date_of_birth} in the date of birth field",
    )

    # --- Address ---
    await perform_action(
        page,
        f"Fill in the address {params.address.street_line1} in the street address field",
    )
    await perform_action(
        page,
        f"Fill in the city {params.address.city} in the city field",
    )
    await perform_action(
        page,
        f"select the state {params.address.state} from the state dropdown",
    )
    await perform_action(
        page,
        f"Fill in the zip code {params.address.zip_code} in the zip code field",
    )
    await perform_action(page, "Click the Continue button")
    # --- Vehicle ---
    await perform_action(
        page,
        f"Choose the {params.vehicle.vehicle_type} option from the dropdown",
    )
    await perform_action(
        page,
        f"Select the year {params.vehicle.year} from the year dropdown",
    )
    await perform_action(
        page,
        f"Select the make {params.vehicle.make} from the make dropdown",
    )
    await perform_action(
        page,
        f"Select the model {params.vehicle.model} from the model dropdown",
    )
    await perform_action(page, "Click the Continue button")

    await perform_action(page, "Click the Continue button")

    # --- Fill driver information ---
    await perform_action(
        page,
        f"Fill in the first name {params.applicant.first_name} in the first name field if the first name field is empty",
    )
    await perform_action(
        page,
        f"Fill in the last name {params.applicant.last_name} in the last name field if the last name field is empty",
    )
    await perform_action(
        page,
        f"click the {params.applicant.gender} radio button",
    )
    await perform_action(
        page,
        f"choose the {params.applicant.marital_status} option from the marital status dropdown",
    )
    if params.applicant.accident_prevention_course:
        await perform_action(page, "Click the Yes radio button.")
    else:
        await perform_action(page, "Click the No radio button.")
    await perform_action(page, "Click the Continue button")
    await perform_action(page, "Click the Continue button")

    # --- Final details ---
    await perform_action(
        page, f"Fill in the email {params.applicant.email} in the email field"
    )
    await perform_action(
        page,
        f"Fill in the phone number {params.applicant.phone_number} in the phone number field",
    )
    if params.applicant.is_cell_phone:
        await perform_action(
            page, "Click the Yes radio button in the Is this a cell phone? field"
        )
    else:
        await perform_action(
            page, "Click the No radio button in the Is this a cell phone? field"
        )
    if params.applicant.can_text:
        await perform_action(
            page,
            "Click the Yes radio button in the Can an ERIE Agent text you about this quote? field",
        )
    else:
        await perform_action(
            page,
            "Click the No radio button in the Can an ERIE Agent text you about this quote? field",
        )
    if params.applicant.preferred_name:
        await perform_action(
            page,
            f"Fill in the preferred name {params.applicant.preferred_name} in the preferred name field",
        )
    if params.applicant.home_multi_policy_discount:
        await perform_action(
            page,
            "Click the Yes radio button in the Would you like our Home Multi-Policy Discount applied to your quote? field",
        )
    else:
        await perform_action(
            page,
            "Click the No radio button in the Would you like our Home Multi-Policy Discount applied to your quote? field",
        )
    if params.applicant.currently_has_auto_insurance:
        await perform_action(
            page,
            "Click the Yes radio button in the Do you currently have auto insurance? field",
        )
    else:
        await perform_action(
            page,
            "Click the No radio button in the Do you currently have auto insurance? field",
        )
    await perform_action(
        page,
        f"Fill in the coverage effective date {params.applicant.coverage_effective_date} in the coverage effective date field",
    )
    await perform_action(page, "Click the Continue button")
    await perform_action(page, "Click the Submit Quote to Agent button")
    result = await page.extract("Extract the confirmation message")
    if result:
        return result
    else:
        raise InvalidActionError("Could not find confirmation message")
