
from intuned_browser import go_to_url
from playwright.async_api import Page
from pydantic import ValidationError
from utils.resend import get_recent_otp
from utils.types_and_schemas import CreateAuthSessionParams


async def create(page: Page, params: dict | None = None, **_kwargs):
    # Validate parameters
    try:
        validated_params = CreateAuthSessionParams.model_validate(params)
    except ValidationError as e:
        raise ValueError(f"Invalid parameters provided: {e}") from e

    username = validated_params.username
    password = validated_params.password

    # Step 1: Navigate to the login page
    # Wait for the page to fully load before proceeding
    await go_to_url(
        page=page,
        url="https://sandbox.intuned.dev/signup",
    )

    # Step 2: Find the email input field and enter the username
    # The locator finds the element with id="email-input"
    email_input = page.locator("#email-input")
    await email_input.fill(username)

    # Step 3: Find the password input field and enter the password
    # The locator finds the element with id="password-input"
    password_input = page.locator("#password-input")
    await password_input.fill(password)

    # Step 4: Click on the Send OTP button
    # This will trigger the OTP email to be sent
    submit_button = page.locator("#submit-button")
    await submit_button.click()

    # Step 5: Wait for OTP input field to appear
    otp_input = page.locator("#otp-input")
    await otp_input.wait_for(state="visible", timeout=10_000)

    # Step 6: Retrieve the OTP code from email
    # Uses Resend API to fetch recent emails and extract OTP
    otp_code = await get_recent_otp()

    if not otp_code:
        raise RuntimeError("Failed to extract OTP from email")

    # Step 7: Fill in the OTP code
    await otp_input.fill(otp_code)

    # Step 8: Click the submit button to complete OTP verification
    otp_submit_button = page.locator("#submit-button")
    await otp_submit_button.click()

    # Step 9: Verify successful login by checking if the protected page is visible
    # If the protected page is not visible, wait_for will raise an exception
    protected_page = page.locator("#book-consultations-title")
    await protected_page.wait_for(state="visible", timeout=10_000)


