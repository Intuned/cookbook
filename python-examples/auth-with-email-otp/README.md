# Auth with Email OTP Example

Authentication automation with **Email-based OTP (One-Time Password)** verification. This example demonstrates how to handle login flows that send OTP codes via email rather than using authenticator apps.

## Overview

This project shows how to automate authentication for websites with **email-based MFA (Multi-Factor Authentication)**. It handles:

1. **Email/Username Login** - Enter email address
2. **Request OTP via Email** - Trigger OTP code to be sent to email
3. **Email OTP Retrieval** - Automatically fetch OTP code from email inbox
4. **OTP Verification** - Submit the OTP code to complete authentication
5. **Session Management** - Creating and validating authenticated sessions

**Key Difference from Secret OTP:** This example retrieves OTP codes from email inbox (via Resend API) instead of generating them from a TOTP secret.

## Getting Started

To get started developing browser automation projects with Intuned, check out our [concepts and terminology](https://docs.intunedhq.com/docs/getting-started/conceptual-guides/core-concepts).

## Prerequisites

- Valid email address registered with the target website
- **Resend API Key** - Required for retrieving OTP codes from email inbox
  - Sign up at [resend.com](https://resend.com)
  - Generate an API key from your dashboard
  - Set as `RESEND_API_KEY` environment variable
- Internet connection

## Development

### Python

#### Install dependencies

```bash
cd python-examples/auth-with-email-otp
poetry install
# or
pip install -r requirements.txt
```

#### Run create auth session

```bash
poetry run intuned run auth-session create
```

#### Run check auth session

```bash
poetry run intuned run auth-session check
```

## Project Structure

```
python-examples/auth-with-email-otp/
├── auth-sessions/
│   ├── create.py          # Create authenticated session with email OTP
│   └── check.py           # Verify session validity
├── utils/
│   ├── types_and_schemas.py # Pydantic validation models
│   └── resend.py          # Email OTP retrieval helper
└── pyproject.toml
```

## How It Works

### Authentication Flow

```
1. Navigate to login page
   └─> https://sandbox.intuned.dev/login-otp-email

2. Enter email address
   └─> Fill email input

3. Request OTP
   └─> Click "Send OTP" button
   └─> OTP code sent to email

4. Retrieve OTP from email
   ├─> Use Resend API to fetch recent emails
   └─> Extract OTP code from email content

5. Submit OTP code
   └─> Fill OTP input and submit

6. Verify successful login
   └─> Check for protected content visibility
```

### Email OTP vs Secret OTP

**Email OTP (This Example):**

- OTP codes are sent via email
- Requires email API access (Resend)
- Codes retrieved from email inbox
- More common for consumer applications

**Secret OTP (Other Example):**

- OTP codes generated from shared secret
- Uses TOTP algorithm (Google Authenticator)
- No email access needed
- More common for enterprise applications

## Usage Example

### Python

```python
from auth_sessions.create import create

params = {
    "username": "user@example.com"
}

is_authenticated = await create(page, params)
print(f"Authenticated: {is_authenticated}")
```

The `get_recent_otp()` function automatically:

1. Fetches recent emails from inbox
2. Extracts OTP code from email content
3. Returns the code for submission

## Environment Variables

**Required:** You must set up your Resend API key before running this example.

Create a `.env` file in the project root (don't commit to version control):

```bash
# Required: Your email address for authentication
APP_USERNAME=your-email@example.com

# Required: Resend API key for retrieving OTP codes from email
# Get your key from: https://resend.com/api-keys
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Important:** The `RESEND_API_KEY` is **required** for this example to work. Without it, the automation cannot retrieve OTP codes from your email inbox.

## Common Issues

### OTP Not Received

- **Cause**: Email delivery delay or API issues
- **Solution**: Add retry logic or increase wait time before fetching emails

### OTP Expired

- **Cause**: OTP codes typically expire after 5-10 minutes
- **Solution**: Retrieve and submit OTP faster, or request a new one

### Email API Rate Limits

- **Cause**: Too many API requests to email service
- **Solution**: Implement rate limiting and caching

### Element Not Found

- **Cause**: Page structure changed or slow loading
- **Solution**: Increase timeouts or use explicit waits

## Dependencies

### Python

- `playwright` - Browser automation
- `intuned-browser` - Intuned helpers
- `pydantic` - Data validation
- `resend` - Resend API for email retrieval

## Resources

- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [Playwright Python Documentation](https://playwright.dev/python/)
- [Resend API Documentation](https://resend.com/docs)
- [Pydantic Documentation](https://docs.pydantic.dev/)
