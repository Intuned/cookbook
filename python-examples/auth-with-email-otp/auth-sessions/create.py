from typing import Optional
from playwright.async_api import Page
from pydantic import ValidationError
from intuned_browser import go_to_url

from utils.types_and_schemas import CreateAuthSessionParams
from utils.resend import get_recent_otp


async def create(page: Page, params: Optional[dict] = None, **_kwargs) -> bool:
    # Validate parameters
    try:
        validated_params = CreateAuthSessionParams.model_validate(params)
    except ValidationError as e:
        raise ValueError(f"Invalid parameters provided: {e}")

    username = validated_params.username

    # Step 1: Navigate to the login page
    # Wait for the page to fully load before proceeding
    await go_to_url(
        page=page,
        url="https://sandbox.intuned.dev/login-otp-email",
    )

    # Step 2: Find the email input field and enter the username
    # The locator finds the element with id="email-input"
    email_input = page.locator("#email-input")
    await email_input.fill(username)

    # Step 3: Click on the Send OTP button
    # This will trigger the OTP email to be sent
    submit_button = page.locator("#submit-button")
    await submit_button.click()

    # Step 4: Wait for OTP input field to appear
    otp_input = page.locator("#otp-input")
    await otp_input.wait_for(state="visible", timeout=10_000)

    # Step 5: Retrieve the OTP code from email
    # Uses Resend API to fetch recent emails and extract OTP
    otp_code = await get_recent_otp()

    if not otp_code:
        raise RuntimeError("Failed to extract OTP from email")

    # Step 6: Fill in the OTP code
    await otp_input.fill(otp_code)

    # Step 7: Click the submit button to complete OTP verification
    otp_submit_button = page.locator("#submit-button")
    await otp_submit_button.click()

    # Step 8: Verify successful login by checking if the protected page is visible
    # If the protected page is visible, it means we successfully logged in
    protected_page = page.locator("#book-consultations-title")
    is_logged_in = True

    try:
        await protected_page.wait_for(state="visible", timeout=10_000)
    except Exception:
        is_logged_in = False

    # Return True if login was successful, False otherwise
    return is_logged_in
