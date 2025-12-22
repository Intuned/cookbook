from typing import Literal
from playwright.async_api import Page, BrowserContext
from stagehand import Stagehand
from intuned_browser import go_to_url
from intuned_runtime import attempt_store, get_ai_gateway_config
from pydantic import BaseModel, Field, field_validator


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
    base_url, api_key = get_ai_gateway_config()
    cdp_url = attempt_store.get("cdp_url")

    # Initialize Stagehand with act/extract/observe capabilities
    stagehand = Stagehand(
        env="LOCAL",
        local_browser_launch_options=dict(
            cdp_url=cdp_url, viewport=dict(width=1280, height=800)
        ),
        model_api_key=api_key,
        model_client_options={
            "baseURL": base_url,
        },
    )
    await stagehand.init()
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
            await stagehand.page.act(f'Type "{name}" in the name input field')
            print("✓ Filled name with Stagehand act")

        # Step 2: Fill email field
        try:
            await page.locator("#email-input").type(email)
            print("✓ Filled email with Playwright")
        except Exception as e:
            print(f"Playwright failed for email, using Stagehand act: {e}")
            await stagehand.page.act(f'Type "{email}" in the email input field')
            print("✓ Filled email with Stagehand act")

        # Step 3: Fill phone field
        try:
            await page.locator(".phone-input").type(phone)
            print("✓ Filled phone with Playwright")
        except Exception as e:
            print(f"Playwright failed for phone, using Stagehand act: {e}")
            await stagehand.page.act(f'Type "{phone}" in the phone input field')
            print("✓ Filled phone with Stagehand act")

        # Step 4: Fill date field
        try:
            await page.locator("#date-input").type(date)
            print("✓ Filled date with Playwright")
        except Exception as e:
            print(f"Playwright failed for date, using Stagehand act: {e}")
            await stagehand.page.act(f'Type "{date}" in the date input field')
            print("✓ Filled date with Stagehand act")

        # Step 5: Fill time field
        try:
            await page.locator("#time-input").fill(time)
            print("✓ Filled time with Playwright")
        except Exception as e:
            print(f"Playwright failed for time, using Stagehand act: {e}")
            await stagehand.page.act(f'Type "{time}" in the time input field')
            print("✓ Filled time with Stagehand act")

        # Step 6: Select the consultation topic from dropdown
        try:
            await page.locator("#topic-select").select_option(topic)
            print("✓ Selected topic with Playwright")
        except Exception as e:
            print(f"Playwright failed for topic selection, using Stagehand act: {e}")
            await stagehand.page.act(f'Select "{topic}" from the topic dropdown')
            print("✓ Selected topic with Stagehand act")

        # Step 7: Submit the booking form
        try:
            await page.locator("#submit-booking-btn").click()
            print("✓ Submitted form with Playwright")
        except Exception as e:
            print(f"Playwright failed for submit, using Stagehand act: {e}")
            await stagehand.page.act("Click the submit button to submit the booking form")
            print("✓ Submitted form with Stagehand act")

        # Step 8: Wait for and verify the success modal
        try:
            await page.locator("#success-modal").wait_for(state="visible", timeout=5000)
            success_text = await page.locator("#success-modal-title").text_content()
            is_success = "Successful" in success_text if success_text else False
            print("✓ Verified success with Playwright")
        except Exception as e:
            print(f"Playwright failed for verification, using Stagehand extract: {e}")
            result = await stagehand.page.extract(
                "Check if the booking was successful. Look for a success modal or confirmation message.",
                schema=SuccessCheck,
            )
            is_success = result.success if result else False
            print(f"✓ Verified with Stagehand extract: {result}")

    finally:
        # Cleanup Stagehand
        print("\nClosing 🤘 Stagehand...")
        await stagehand.close()

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
