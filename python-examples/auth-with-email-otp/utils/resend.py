import os
import re
import asyncio
from datetime import datetime, timezone
from typing import Optional
import resend

# Initialize Resend client
resend.api_key = os.getenv("RESEND_API_KEY")


def extract_otp_from_text(text: str) -> Optional[str]:
    # Look for numeric codes (4-12 digits) - more flexible for various OTP formats
    otp_pattern = r"\b\d{4,12}\b"
    matches = re.findall(otp_pattern, text)

    if matches:
        # Return the longest match (likely to be the OTP code)
        return max(matches, key=len)

    return None


def is_email_recent(created_at: str, max_age_seconds: int = 30) -> bool:
    try:
        # Parse the email timestamp
        email_time = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)

        # Calculate difference in seconds
        diff_in_seconds = (now - email_time).total_seconds()

        return diff_in_seconds <= max_age_seconds

    except Exception as e:
        print(f"Error parsing email timestamp: {e}")
        return False


async def get_latest_email() -> dict:
    try:
        # Resend Python SDK is synchronous, but we wrap in async for consistency
        emails = resend.Emails.Receiving.list()

        if not emails or not emails.get("data") or len(emails["data"]) == 0:
            raise Exception("No emails found")

        return emails["data"][0]

    except Exception as e:
        raise Exception(f"Failed to get latest email: {str(e)}")


async def get_email_details(email_id: str) -> dict:
    try:
        message = resend.Emails.Receiving.get(email_id=email_id)

        if not message:
            raise Exception(f"Email with ID {email_id} not found")

        return message

    except Exception as e:
        raise Exception(f"Failed to get email details: {str(e)}")


async def get_recent_otp(
    max_age_seconds: int = 30,
    timeout_seconds: int = 30,
    polling_interval_ms: int = 2000,
) -> Optional[str]:
    timeout_delta = asyncio.get_event_loop().time() + timeout_seconds
    attempt_number = 0

    while asyncio.get_event_loop().time() < timeout_delta:
        attempt_number += 1

        try:
            print(f"Attempt {attempt_number}: Checking for OTP...")

            # Get the latest email
            latest_email = await get_latest_email()

            # Check if it's recent enough
            if latest_email and not is_email_recent(
                latest_email.get("created_at", ""), max_age_seconds
            ):
                print("Latest email is too old, waiting for new email...")

            elif not latest_email.get("id"):
                print("No latest email found, retrying...")

            else:
                # Get full email details
                email_details = await get_email_details(latest_email["id"])

                # Extract OTP from text content
                otp = extract_otp_from_text(email_details.get("text", ""))

                if otp:
                    print(
                        f"Found OTP: {otp} from email received at "
                        f"{latest_email.get('created_at')} "
                        f"(after {attempt_number} attempt(s))"
                    )
                    return otp
                else:
                    print("No OTP found in email, retrying...")

        except Exception as error:
            print(f"Error on attempt {attempt_number}: {error}")

        # Wait before next attempt if we haven't timed out
        elapsed = asyncio.get_event_loop().time()
        if elapsed < timeout_delta:
            remaining_time = (timeout_delta - elapsed) * 1000  # Convert to ms
            wait_time = (
                min(polling_interval_ms, remaining_time) / 1000
            )  # Convert back to seconds
            print(f"Waiting {wait_time * 1000:.0f}ms before next attempt...")
            await asyncio.sleep(wait_time)

    print(
        f"Timeout reached after {attempt_number} attempts and "
        f"{timeout_seconds}s. No OTP found."
    )
    return None
