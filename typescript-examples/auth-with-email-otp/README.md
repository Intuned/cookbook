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

### TypeScript

#### Install dependencies

```bash
cd typescript-examples/auth-with-email-otp
npm install
```

#### Run create auth session

```bash
npm run create-session -- --username "user@example.com"
```

#### Run check auth session

```bash
npm run check-session
```

## Project Structure

```
typescript-examples/auth-with-email-otp/
├── auth-sessions/
│   ├── create.ts          # Create authenticated session with email OTP
│   └── check.ts           # Verify session validity
├── utils/
│   ├── typesAndSchemas.ts # Zod validation schemas
│   └── resend.ts          # Email OTP retrieval helper
└── package.json
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

### TypeScript

```typescript
import create from "./auth-sessions/create";

const params = {
  username: "user@example.com",
};

const isAuthenticated = await create(params, page, context);
console.log(`Authenticated: ${isAuthenticated}`);
```

The `getRecentOTP()` function automatically:

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

### TypeScript

- `@intuned/browser` - Intuned helpers
- `playwright` - Browser automation
- `zod` - Schema validation
- Resend API or similar email service

## Resources

- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [Playwright Documentation](https://playwright.dev/)
- [Resend API Documentation](https://resend.com/docs)
