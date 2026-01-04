
import pyotp
from intuned_browser import go_to_url
from playwright.async_api import Page
from utils.types_and_schemas import CreateAuthSessionParams


async def create(page: Page, params: dict | None = None, **_kwargs):
    try:
        validated_params = CreateAuthSessionParams.model_validate(params)
    except Exception as e:
        raise ValueError(f"Invalid parameters provided: {e}")

    # Step 1: Navigate to the login page
    # Wait for the page to fully load before proceeding
    await go_to_url(
        page=page,
        url="https://sandbox.intuned.dev/login-otp",
    )

    # Step 2: Find the email input field and enter the username
    # The locator finds the element with id="email-input"
    email_input = page.locator("#email-input")
    await email_input.fill(validated_params.username)

    # Step 3: Find the password input field and enter the password
    # The locator finds the element with id="password-input"
    password_input = page.locator("#password-input")
    await password_input.fill(validated_params.password)

    # Step 4: Click the Continue to OTP button
    submit_button = page.locator("#submit-button")
    await submit_button.click()

    # Step 5: Generate the OTP code using the secret
    otp_input = page.locator("#otp-input")
    totp = pyotp.TOTP(validated_params.secret)
    generated_otp = totp.now()
    await otp_input.fill(generated_otp)

    # Step 6: Click the submit button to complete OTP verification
    submit_button = page.locator("#submit-button")
    await submit_button.click()

    # Step 7: Verify successful login by checking if the protected page is visible
    protected_page = page.locator("#book-consultations-title")
    is_logged_in = True
    try:
        await protected_page.wait_for(state="visible")
    except Exception:
        is_logged_in = False

    # Return True if login was successful, False otherwise
    return is_logged_in
