from typing import Literal
import os

from intuned_browser import go_to_url
from intuned_runtime import attempt_store, get_ai_gateway_config
from playwright.async_api import BrowserContext, Page
from pydantic import BaseModel, Field, field_validator

from stagehand import AsyncStagehand


class BookConsultationSchema(BaseModel):
    name: str
    email: str
    phone: str
    date: str
    time: str
    topic: Literal[
        "web-scraping", "data-extraction", "automation", "api-integration", "other"
    ]

    @field_validator("name", "phone", "date", "time")
    @classmethod
    def validate_not_empty(cls, v: str) -> str:
        if not v or len(v.strip()) < 1:
            raise ValueError("Field is required")
        return v


class SuccessCheck(BaseModel):
    success: bool = Field(..., description="Whether the booking was successful")
    message: str = Field(..., description="The success or error message displayed")


async def automation(
    page: Page,
    params: dict | None = None,
    _context: BrowserContext | None = None,
    **_kwargs,
) -> dict:
    base_url, model_api_key = get_ai_gateway_config()
    model_api_key = os.getenv("MODEL_API_KEY")
    cdp_url = attempt_store.get("cdp_url")

    # Initialize Stagehand with act/extract/observe capabilities
    client = AsyncStagehand(
        server="local",
        model_api_key=model_api_key,
        local_ready_timeout_s=30.0,
    )
    print("⏳ Starting local session (this will start the embedded SEA binary)...")
    session = await client.sessions.start(
        model_name="openai/gpt-4o-mini",
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

    # Validate input parameters using schema
    if params is None:
        raise ValueError("Params are required")

    validated_params = BookConsultationSchema(**params)

    # Extract validated parameters
    name = validated_params.name
    email = validated_params.email
    phone = validated_params.phone
    date = validated_params.date
    time = validated_params.time
    topic = validated_params.topic

    is_success = False

    try:
        # Navigate to the consultation booking page
        await go_to_url(
            page=page,
            url="https://sandbox.intuned.dev/consultations/book",
        )

        # Step 1: Fill name field
        try:
            await page.locator("#name-input").type(name)
            print("✓ Filled name with Playwright")
        except Exception as e:
            print(f"Playwright failed for name, using Stagehand act: {e}")
            await client.sessions.act(
                id=session_id,
                input=f'Type "{name}" in the name input field',
            )
            print("✓ Filled name with Stagehand act")

        # Step 2: Fill email field
        try:
            await page.locator("#email-input").type(email)
            print("✓ Filled email with Playwright")
        except Exception as e:
            print(f"Playwright failed for email, using Stagehand act: {e}")
            await client.sessions.act(
                id=session_id,
                input=f'Type "{email}" in the email input field',
            )
            print("✓ Filled email with Stagehand act")

        # Step 3: Fill phone field
        try:
            await page.locator(".phone-input").type(phone)
            print("✓ Filled phone with Playwright")
        except Exception as e:
            print(f"Playwright failed for phone, using Stagehand act: {e}")
            await client.sessions.act(
                id=session_id,
                input=f'Type "{phone}" in the phone input field',
            )
            print("✓ Filled phone with Stagehand act")

        # Step 4: Fill date field
        try:
            await page.locator("#date-input").type(date)
            print("✓ Filled date with Playwright")
        except Exception as e:
            print(f"Playwright failed for date, using Stagehand act: {e}")
            await client.sessions.act(
                id=session_id,
                input=f'Type "{date}" in the date input field',
            )
            print("✓ Filled date with Stagehand act")

        # Step 5: Fill time field
        try:
            await page.locator("#time-input").fill(time)
            print("✓ Filled time with Playwright")
        except Exception as e:
            print(f"Playwright failed for time, using Stagehand act: {e}")
            await client.sessions.act(
                id=session_id,
                input=f'Type "{time}" in the time input field',
            )
            print("✓ Filled time with Stagehand act")

        # Step 6: Select the consultation topic from dropdown
        try:
            await page.locator("#topic-select").select_option(topic)
            print("✓ Selected topic with Playwright")
        except Exception as e:
            print(f"Playwright failed for topic selection, using Stagehand act: {e}")
            await client.sessions.act(
                id=session_id,
                input=f'Select "{topic}" from the topic dropdown',
            )
            print("✓ Selected topic with Stagehand act")

        # Step 7: Submit the booking form
        try:
            await page.locator("#submit-booking-btn").click()
            print("✓ Submitted form with Playwright")
        except Exception as e:
            print(f"Playwright failed for submit, using Stagehand act: {e}")
            await client.sessions.act(
                id=session_id,
                input="Click the submit button to submit the booking form",
            )
            print("✓ Submitted form with Stagehand act")

        # Step 8: Wait for and verify the success modal
        try:
            await page.locator("#success-modal").wait_for(state="visible", timeout=5000)
            success_text = await page.locator("#success-modal-title").text_content()
            is_success = "Successful" in success_text if success_text else False
            print("✓ Verified success with Playwright")
        except Exception as e:
            print(f"Playwright failed for verification, using Stagehand extract: {e}")
            result = await client.sessions.extract(
                id=session_id,
                instruction="Check if the booking was successful. Look for a success modal or confirmation message.",
                schema={
                    "type": "object",
                    "properties": {
                        "success": {
                            "type": "boolean",
                            "description": "Whether the booking was successful",
                        },
                        "message": {
                            "type": "string",
                            "description": "The success or error message displayed",
                        },
                    },
                    "required": ["success", "message"],
                },
            )
            result_data = (
                SuccessCheck.model_validate(result.data.result)
                if result.data.result
                else None
            )
            is_success = result_data.success if result_data else False
            print(f"✓ Verified with Stagehand extract: {result_data}")

    finally:
        # Cleanup Stagehand
        print("\nClosing 🤘 Stagehand...")
        await client.sessions.end(session_id)
        print("✅ Session ended")

    # Return booking details
    return {
        "success": is_success,
        "date": date,
        "message": (
            f"Consultation successfully booked for {date} at {time}"
            if is_success
            else "Booking completed but success confirmation unclear"
        ),
    }
