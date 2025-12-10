from playwright.async_api import Page, BrowserContext
from typing import TypedDict, Literal


class Params(TypedDict):
    name: str
    email: str
    phone: str
    date: str
    time: str
    topic: Literal["web-scraping", "data-extraction", "automation", "api-integration", "other"]


async def automation(
    page: Page,
    params: Params | None = None,
    context: BrowserContext | None = None,
    **_kwargs
):
    if params is None:
        return {
            "success": False,
            "message": "Params are required for booking a consultation",
        }

    # Set the browser viewport size to 1080x720 pixels
    # This ensures consistent rendering across different devices and screen sizes
    # Some websites may display different layouts or elements based on viewport size
    await page.set_viewport_size({"width": 1080, "height": 720})

    try:
        # Extract parameters
        name = params["name"]
        email = params["email"]
        phone = params["phone"]
        date = params["date"]
        time = params["time"]
        topic = params["topic"]

        # Step 1: Navigate to the consultation booking page
        # wait_until="networkidle" ensures the page is fully loaded
        await page.goto(
            "https://sandbox.intuned.dev/consultations/book",
            wait_until="networkidle",
            timeout=30_000
        )

        # Step 2: Wait for the booking form to be visible
        # This ensures the form has loaded before we try to interact with it
        consultation_form = page.locator("#consultation-form")
        await consultation_form.wait_for(state="visible")

        # Step 3: Fill in personal information fields
        name_input = page.locator("#name-input")
        await name_input.fill(name)

        email_input = page.locator("#email-input")
        await email_input.fill(email)

        phone_input = page.locator("#phone-input")
        await phone_input.fill(phone)

        # Step 4: Fill in scheduling information
        date_input = page.locator("#date-input")
        await date_input.fill(date)

        time_input = page.locator("#time-input")
        await time_input.fill(time)

        # Step 5: Select the consultation topic from dropdown
        topic_select = page.locator("#topic-select")
        await topic_select.select_option(topic)

        # Step 6: Submit the booking form
        submit_button = page.locator("#submit-booking-btn")
        await submit_button.click()

        # Step 7: Wait for the success modal to appear
        # This confirms the booking was processed
        success_modal = page.locator("#success-modal")
        await success_modal.wait_for(state="visible", timeout=5000)

        # Step 8: Verify the success message is displayed
        success_title = page.locator("#success-modal-title")
        success_text = await success_title.text_content()
        is_success = "Successful" in success_text if success_text else False

        # Step 9: Return success response with booking details
        return {
            "success": is_success,
            "date": date,
            "message": (
                f"Consultation successfully booked for {date} at {time}"
                if is_success
                else "Booking completed but success confirmation unclear"
            ),
        }
    except Exception as error:
        # Handle any errors that occur during the booking process
        error_message = str(error)

        # Return error response instead of raising
        # This makes it easier for the calling code to handle failures
        return {
            "success": False,
            "message": f"Failed to book consultation: {error_message}",
            "error": error_message,
        }