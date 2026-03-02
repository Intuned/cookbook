from stagehand import AsyncStagehand
from playwright.async_api import Page
from intuned_runtime import attempt_store, get_ai_gateway_config
from utils.types_and_schemas import ListParameters


class InvalidActionError(Exception):
    pass


async def automation(page: Page, params: ListParameters, *args: ..., **kwargs: ...):
    base_url, model_api_key = get_ai_gateway_config()
    cdp_url = attempt_store.get("cdp_url")

    model_name = "openai/gpt-5-mini"
    model_config = {
        "model_name": model_name,
        "api_key": model_api_key,
        "base_url": base_url,
        "provider": "openai",
    }

    # Initialize Stagehand with act/extract/observe capabilities
    client = AsyncStagehand(
        server="local",
        model_api_key=model_api_key,
        local_ready_timeout_s=30.0,
    )
    print("⏳ Starting local session (this will start the embedded SEA binary)...")
    session = await client.sessions.start(
        model_name=model_name,
        browser={
            "type": "local",
            "launchOptions": {
                "headless": False,
                "cdpUrl": cdp_url,
            },
        },
    )
    session_id = session.data.session_id
    print(f"✅ Session started: {session_id}")
    print("\nInitialized 🤘 Stagehand")
    await page.set_viewport_size({"width": 1280, "height": 800})

    async def perform_action(page: Page, instruction: str) -> None:
        for _ in range(3):
            observed = await client.sessions.observe(
                id=session_id,
                instruction=instruction,
                options={"model": model_config},
            )
            if observed.data.result:
                await client.sessions.act(
                    id=session_id,
                    input=instruction,
                    options={"model": model_config},
                )
                await page.wait_for_load_state("domcontentloaded")
                await page.wait_for_timeout(2000)
                return
            else:
                await page.wait_for_timeout(2000)
        raise InvalidActionError(f"Could not find action for instruction: {instruction}")

    params = ListParameters.model_validate(params)

    site = params.metadata.site

    try:
        await client.sessions.navigate(id=session_id, url=site)

        # --- Object type selection ---
        await perform_action(
            page,
            f"Choose the {params.metadata.insurance_type} option from the insurance type dropdown",
        )

        # --- ZIP entry ---
        await perform_action(
            page,
            f"Fill in the zip code {params.address.zip_code} in the zip code field",
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
        await perform_action(
            page,
            f"Fill in the model details {params.vehicle.model_details} in the model details field if not already filled",
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
            page,
            f"Fill in the email {params.applicant.email} in the email field",
        )
        await perform_action(
            page,
            f"Fill in the phone number {params.applicant.phone_number} in the phone number field",
        )
        if params.applicant.is_cell_phone:
            await perform_action(
                page,
                "Click the Yes radio button in the Is this a cell phone? field",
            )
        else:
            await perform_action(
                page,
                "Click the No radio button in the Is this a cell phone? field",
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

        result = await client.sessions.extract(
            id=session_id,
            instruction="Extract the confirmation message",
            options={"model": model_config},
            schema={
                "type": "object",
                "properties": {
                    "message": {"type": "string"},
                },
                "required": ["message"],
            },
        )
        if result.data.result:
            return result.data.result
        else:
            raise InvalidActionError("Could not find confirmation message")

    finally:
        # Cleanup Stagehand
        print("\nClosing 🤘 Stagehand...")
        await client.sessions.end(session_id)
        print("✅ Session ended")
