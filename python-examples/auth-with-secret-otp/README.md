# Auth with Secret OTP Example

Authentication automation with multi-step OTP (One-Time Password) verification. This example demonstrates how to handle login flows that require both username/password and time-based OTP codes (similar to Google Authenticator).

## Overview

This project shows how to automate authentication for websites with **multi-factor authentication (MFA)** using TOTP (Time-based One-Time Password). It handles:

1. **Username/Password Login** - First authentication step
2. **OTP Verification** - Second step using TOTP codes generated from a secret
3. **Session Management** - Creating and validating authenticated sessions
4. **Protected Resource Access** - Making API calls that require authentication

Available in both **TypeScript** and **Python**.

## Getting Started

To get started developing browser automation projects with Intuned, check out our [concepts and terminology](https://docs.intunedhq.com/docs/getting-started/conceptual-guides/core-concepts).

## Prerequisites

- Valid username and password for the target website
- TOTP secret key (Base32 encoded string, provided when setting up 2FA)
- Internet connection

## Development

### TypeScript

#### Install dependencies
```bash
cd typescript-examples/auth-with-secret-otp
npm install
```

#### Run create auth session
```bash
npm run create-session -- --username "user@example.com" --password "your-password" --secret "JBSWY3DPEHPK3PXP"
```

#### Run check auth session
```bash
npm run check-session
```

### Python

#### Install dependencies
```bash
cd python-examples/auth-with-secret-otp
uv sync
# or
pip install -e .
```

#### Run create auth session
```bash
uv run intuned run auth-session create --parameters-file .parameters/auth/create.json
```

#### Run check auth session
```bash
uv run intuned run auth-session check --parameters-file .parameters/auth/check.json
```

#### Run list contracts API
```bash
uv run intuned run api list-contracts
```

## Project Structure

### TypeScript
```
typescript-examples/auth-with-secret-otp/
├── auth-sessions/
│   ├── create.ts          # Create authenticated session with OTP
│   └── check.ts           # Verify session validity
├── api/
│   └── list-contracts.ts  # Example: Extract contracts from authenticated page
├── utils/
│   └── typesAndSchemas.ts # Zod validation schemas
└── package.json
```

### Python
```
python-examples/auth-with-secret-otp/
├── auth-sessions/
│   ├── create.py           # Create authenticated session with OTP
│   └── check.py            # Verify session validity
├── api/
│   └── list-contracts.py   # Example: Extract contracts from authenticated page
├── utils/
│   └── types_and_schemas.py # Pydantic validation models
├── .parameters/
│   └── auth/
│       ├── create.json     # Parameters for create auth session
│       └── check.json      # Parameters for check auth session
├── Intuned.jsonc           # Intuned project configuration
├── pyproject.toml          # Python dependencies
└── uv.lock                 # Lock file for uv package manager
```

## How It Works

### Authentication Flow

```
1. Navigate to login page
   └─> https://sandbox.intuned.dev/login-otp

2. Enter credentials
   ├─> Fill username (email)
   └─> Fill password

3. Submit login form

4. Generate OTP code
   ├─> Use TOTP secret
   └─> Generate 6-digit code (changes every 30 seconds)

5. Submit OTP code

6. Verify successful login
   └─> Check for protected content visibility
```

### TOTP (Time-Based One-Time Password)

The OTP system uses **TOTP** to generate 6-digit codes that expire every 30 seconds:
- Uses a shared **secret key** (Base32 encoded)
- Synchronized with **current time**
- Same algorithm as Google Authenticator, Authy, etc.

## Usage Examples

### TypeScript

```typescript
import create from "./auth-sessions/create";

const params = {
  username: "user@example.com",
  password: "your-password",
  secret: "JBSWY3DPEHPK3PXP"  // Your TOTP secret
};

const isAuthenticated = await create(params, page, context);
console.log(`Authenticated: ${isAuthenticated}`);
```

### Python

```python
from auth_sessions.create import create

params = {
    "username": "user@example.com",
    "password": "your-password",
    "secret": "JBSWY3DPEHPK3PXP"  # Your TOTP secret
}

is_authenticated = await create(page, params)
print(f"Authenticated: {is_authenticated}")
```

### Using Protected APIs

Once authenticated, you can access protected resources like the contracts list:

#### TypeScript
```typescript
import listContracts from "./api/list-contracts";

// After successful authentication
const result = await listContracts({}, page, context);

if (result.success) {
  console.log(`Found ${result.contracts.length} contracts`);
  result.contracts.forEach(contract => {
    console.log(`- ${contract.name} (${contract.state})`);
  });
} else {
  console.error(`Error: ${result.message}`);
}
```

#### Python
```python
from api.list_contracts import handler

# After successful authentication
result = await handler(page)

if result.success:
    print(f"Found {len(result.contracts)} contracts")
    for contract in result.contracts:
        print(f"- {contract.name} ({contract.state})")
else:
    print(f"Error: {result.message}")
```

## Configuration

### Parameters Files

The project uses `.parameters` files to store test data. Update the values in `.parameters/auth/create.json`:

```json
{
  "username": "your-email@example.com",
  "password": "your-secure-password",
  "secret": "JBSWY3DPEHPK3PXP"
}
```

**Note**: Don't commit sensitive credentials to version control. Add `.parameters` to `.gitignore` if needed.

### Environment Variables (Optional)

Alternatively, you can create a `.env` file (don't commit to version control):

```bash
APP_USERNAME=your-email@example.com
APP_PASSWORD=your-secure-password
OTP_SECRET=JBSWY3DPEHPK3PXP
```

## Common Issues

### OTP Verification Failed
- **Cause**: OTP code expired (codes change every 30 seconds)
- **Solution**: Use the Python refactored version which includes automatic retry logic

### Element Not Found
- **Cause**: Page structure changed or slow loading
- **Solution**: Increase timeouts or use explicit waits

### Session Expired
- **Cause**: Authentication session timed out
- **Solution**: Re-run create auth session

## Dependencies

### TypeScript
- `@intuned/browser` - Intuned helpers
- `playwright` - Browser automation
- `otplib` - TOTP implementation
- `zod` - Schema validation

### Python
- `playwright` - Browser automation
- `pyotp` - TOTP implementation
- `pydantic` - Data validation

## Resources

- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [Playwright Documentation](https://playwright.dev/)
- [TOTP Algorithm (RFC 6238)](https://tools.ietf.org/html/rfc6238)
