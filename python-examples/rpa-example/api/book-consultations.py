from playwright.async_api import Page, BrowserContext
from intuned_browser import go_to_url

from utils.types_and_schemas import BookConsultationSchema


async def fill_personal_information(page: Page, name: str, email: str, phone: str):
    name_input = page.locator("#name-input")
    await name_input.fill(name)

    email_input = page.locator("#email-input")
    await email_input.fill(email)

    phone_input = page.locator("#phone-input")
    await phone_input.fill(phone)


async def fill_scheduling_information(page: Page, date: str, time: str):
    date_input = page.locator("#date-input")
    await date_input.fill(date)

    time_input = page.locator("#time-input")
    await time_input.fill(time)


async def select_topic(page: Page, topic: str):
    topic_select = page.locator("#topic-select")
    await topic_select.select_option(topic)


async def submit_booking_form(page: Page):
    submit_button = page.locator("#submit-booking-btn")
    await submit_button.click()


async def wait_for_success_modal(page: Page):
    success_modal = page.locator("#success-modal")
    await success_modal.wait_for(state="visible", timeout=5000)


async def verify_success_message(page: Page) -> bool:
    success_title = page.locator("#success-modal-title")
    success_text = await success_title.text_content()
    return "Successful" in success_text if success_text else False


async def automation(
    page: Page,
    params: dict | None = None,
    context: BrowserContext | None = None,
    **_kwargs,
) -> dict:
    # Set the browser viewport size to 1080x720 pixels
    # This ensures consistent rendering across different devices and screen sizes
    # Some websites may display different layouts or elements based on viewport size
    await page.set_viewport_size({"width": 1080, "height": 720})

    # Step 1: Validate input parameters using schema
    # This ensures all required fields are present and properly formatted
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

    # Step 2: Navigate to the consultation booking page
    await go_to_url(
        page=page,
        url="https://sandbox.intuned.dev/consultations/book",
    )

    # Step 3: Fill in personal information fields
    await fill_personal_information(page, name, email, phone)

    # Step 4: Fill in scheduling information
    await fill_scheduling_information(page, date, time)

    # Step 5: Select the consultation topic from dropdown
    await select_topic(page, topic)

    # Step 6: Submit the booking form and wait for confirmation
    await submit_booking_form(page)

    # Step 7: Wait for the success modal to appear
    # This confirms the booking was processed
    await wait_for_success_modal(page)

    # Step 8: Verify the success message is displayed
    is_success = await verify_success_message(page)

    # Step 9: Return booking details
    return {
        "success": is_success,
        "date": date,
        "message": (
            f"Consultation successfully booked for {date} at {time}"
            if is_success
            else "Booking completed but success confirmation unclear"
        ),
    }
