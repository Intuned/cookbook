# Authentication with Secret OTP - Intuned Example

This example demonstrates how to handle **multi-step authentication** with One-Time Passwords (OTP) using Intuned's browser automation SDK. It shows how to automate login flows that require both traditional credentials (username/password) and time-based OTP codes, similar to Google Authenticator or other 2FA applications.

## 📋 Table of Contents

- [Overview](#overview)
- [Use Cases](#use-cases)
- [How It Works](#how-it-works)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
  - [TypeScript Setup](#typescript-setup)
  - [Python Setup](#python-setup)
- [Usage](#usage)
  - [Creating Auth Sessions](#creating-auth-sessions)
  - [Checking Auth Sessions](#checking-auth-sessions)
  - [Using Protected APIs](#using-protected-apis)
- [Code Examples](#code-examples)
- [Best Practices Applied](#best-practices-applied)
- [Troubleshooting](#troubleshooting)
- [Additional Resources](#additional-resources)

---

## 🎯 Overview

This project demonstrates browser automation for websites that require **multi-factor authentication (MFA)** with TOTP (Time-based One-Time Password). It handles:

1. **Username/Password Login**: First step of authentication
2. **OTP Verification**: Second step using TOTP codes generated from a secret
3. **Session Management**: Creating and validating authenticated sessions
4. **Protected Resource Access**: Making API calls that require authentication

The implementation is available in both **TypeScript** and **Python**, showcasing best practices for each language.

### Real-World Applications

- Automating access to admin panels with 2FA
- Scheduled data extraction from authenticated sources
- Testing authentication flows
- Monitoring applications behind MFA
- Automated form submissions in protected areas

---

## 💡 Use Cases

### 1. Booking System Automation
Access a protected booking system to:
- Create new consultations
- Retrieve booking information
- Update appointments
- Generate reports

### 2. Authenticated Data Extraction
Extract data from dashboards requiring 2FA:
- Financial data from banking portals
- Analytics from admin dashboards
- Customer data from CRM systems
- Inventory data from management systems

### 3. Continuous Monitoring
Monitor protected resources:
- Health checks for authenticated endpoints
- Session validity verification
- Automated testing of auth flows
- Compliance monitoring

---

## 🔐 How It Works

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Authentication Flow                       │
└─────────────────────────────────────────────────────────────┘

1. Navigate to Login Page
   └─> https://sandbox.intuned.dev/login-otp

2. Enter Credentials
   ├─> Fill username (email)
   └─> Fill password

3. Submit Login Form
   └─> Click submit button

4. OTP Challenge Appears
   └─> Wait for OTP input field

5. Generate OTP Code
   ├─> Use TOTP secret
   └─> Generate time-based code (pyotp/otplib)

6. Submit OTP
   ├─> Fill OTP code
   └─> Click submit button

7. Verify Success
   ├─> Check for protected content
   └─> Return authentication status

8. Access Protected Resources
   └─> Use authenticated session
```

### TOTP (Time-Based One-Time Password)

The OTP system uses **TOTP**, which generates 6-digit codes that change every 30 seconds based on:
- **Secret Key**: A shared secret (Base32 encoded string)
- **Current Time**: Unix timestamp divided by 30 seconds
- **Algorithm**: HMAC-SHA1 hashing

This is the same algorithm used by:
- Google Authenticator
- Microsoft Authenticator
- Authy
- Other 2FA apps

---

## 📁 Project Structure

### TypeScript Version
```
typescript-examples/auth-with-secret-otp/
├── auth-sessions/
│   ├── create.ts          # Create authenticated session
│   └── check.ts           # Verify session validity
├── api/
│   ├── book-consultations.ts           # Book new consultations
│   └── get-consultations-by-email.ts   # Retrieve consultations
├── utils/
│   └── typesAndSchemas.ts # Zod schemas for validation
└── package.json
```

### Python Version
```
python-examples/auth-with-secret-otp/
├── auth-sessions/
│   ├── create.py           # Create authenticated session
│   ├── create_refactored.py # Enhanced version with best practices
│   └── check.py            # Verify session validity
├── api/
│   ├── book-consultations.py           # Book new consultations
│   └── get-consultations-by-email.py   # Retrieve consultations
├── utils/
│   └── types_and_schemas.py # Pydantic models for validation
└── requirements.txt
```

---

## ✅ Prerequisites

### Common Requirements
- Access to the target website
- TOTP secret key (provided when setting up 2FA)
- Valid username and password
- Internet connection

### TypeScript Requirements
- Node.js 16+ or higher
- npm or yarn package manager

### Python Requirements
- Python 3.8+ or higher
- pip package manager
- Virtual environment (recommended)

---

## 🚀 Setup Instructions

### TypeScript Setup

#### 1. Install Dependencies
```bash
cd typescript-examples/auth-with-secret-otp
npm install
```

#### 2. Install Intuned SDK
```bash
npm install @intuned/browser
npm install playwright
npm install zod otplib
```

#### 3. Verify Installation
```bash
npm list @intuned/browser
```

### Python Setup

#### 1. Create Virtual Environment
```bash
cd python-examples/auth-with-secret-otp
python -m venv .venv
```

#### 2. Activate Virtual Environment
```bash
# macOS/Linux
source .venv/bin/activate

# Windows
.venv\Scripts\activate
```

#### 3. Install Dependencies
```bash
pip install playwright
pip install pyotp
pip install pydantic
```

#### 4. Install Playwright Browsers
```bash
playwright install chromium
```

---

## 📖 Usage

### Creating Auth Sessions

#### TypeScript Example
```typescript
import { BrowserContext, Page } from "playwright";
import create from "./auth-sessions/create";

const params = {
  username: "user@example.com",
  password: "your-secure-password",
  secret: "JBSWY3DPEHPK3PXP"  // Your TOTP secret
};

const isAuthenticated = await create(params, page, context);

if (isAuthenticated) {
  console.log("Successfully authenticated!");
} else {
  console.log("Authentication failed");
}
```

#### Python Example
```python
from playwright.async_api import Page
from auth_sessions.create import create

params = {
    "username": "user@example.com",
    "password": "your-secure-password",
    "secret": "JBSWY3DPEHPK3PXP"  # Your TOTP secret
}

is_authenticated = await create(page, params)

if is_authenticated:
    print("Successfully authenticated!")
else:
    print("Authentication failed")
```

### Checking Auth Sessions

#### TypeScript Example
```typescript
import check from "./auth-sessions/check";

const isValid = await check(page, context);

if (isValid) {
  console.log("Session is still valid");
} else {
  console.log("Session expired, need to re-authenticate");
}
```

#### Python Example
```python
from auth_sessions.check import check

is_valid = await check(page)

if is_valid:
    print("Session is still valid")
else:
    print("Session expired, need to re-authenticate")
```

### Using Protected APIs

Once authenticated, you can access protected resources:

#### Booking a Consultation (TypeScript)
```typescript
import bookConsultation from "./api/book-consultations";

const bookingParams = {
  name: "John Doe",
  email: "john@example.com",
  phone: "+1-555-0123",
  date: "2024-12-20",
  time: "14:00",
  topic: "web-scraping"
};

const result = await bookConsultation(bookingParams, page, context);
console.log("Booking result:", result);
```

#### Retrieving Consultations (Python)
```python
from api.get_consultations_by_email import handler

params = {
    "email": "john@example.com"
}

consultations = await handler(page, params)
print(f"Found {len(consultations)} consultations")
```

---

## 💻 Code Examples

### Complete Authentication Flow (TypeScript)

```typescript
import { chromium } from "playwright";
import create from "./auth-sessions/create";
import check from "./auth-sessions/check";
import bookConsultation from "./api/book-consultations";

async function automateWithAuth() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Step 1: Authenticate
    const authParams = {
      username: process.env.APP_USERNAME!,
      password: process.env.APP_PASSWORD!,
      secret: process.env.OTP_SECRET!
    };

    console.log("Authenticating...");
    const authenticated = await create(authParams, page, context);

    if (!authenticated) {
      throw new Error("Authentication failed");
    }

    console.log("✅ Authentication successful");

    // Step 2: Verify session
    const sessionValid = await check(page, context);
    console.log(`Session valid: ${sessionValid}`);

    // Step 3: Use protected API
    const bookingResult = await bookConsultation({
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1-555-0456",
      date: "2024-12-21",
      time: "10:00",
      topic: "automation"
    }, page, context);

    console.log("✅ Booking created:", bookingResult);

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await browser.close();
  }
}

automateWithAuth();
```

### Complete Authentication Flow (Python)

```python
import asyncio
import os
from playwright.async_api import async_playwright
from auth_sessions.create import create
from auth_sessions.check import check
from api.book_consultations import handler as book_consultation

async def automate_with_auth():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context()
        page = await context.new_page()

        try:
            # Step 1: Authenticate
            auth_params = {
                "username": os.getenv("APP_USERNAME"),
                "password": os.getenv("APP_PASSWORD"),
                "secret": os.getenv("OTP_SECRET")
            }

            print("Authenticating...")
            authenticated = await create(page, auth_params)

            if not authenticated:
                raise Exception("Authentication failed")

            print("✅ Authentication successful")

            # Step 2: Verify session
            session_valid = await check(page)
            print(f"Session valid: {session_valid}")

            # Step 3: Use protected API
            booking_params = {
                "name": "Jane Smith",
                "email": "jane@example.com",
                "phone": "+1-555-0456",
                "date": "2024-12-21",
                "time": "10:00",
                "topic": "automation"
            }

            booking_result = await book_consultation(page, booking_params)
            print("✅ Booking created:", booking_result)

        except Exception as error:
            print(f"❌ Error: {error}")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(automate_with_auth())
```

### Environment Variables Setup

Create a `.env` file (don't commit this to version control!):

```bash
# .env file
APP_USERNAME=your-email@example.com
APP_PASSWORD=your-secure-password
OTP_SECRET=JBSWY3DPEHPK3PXP
```

Load environment variables:

**TypeScript** (using dotenv):
```typescript
import dotenv from 'dotenv';
dotenv.config();
```

**Python** (using python-dotenv):
```python
from dotenv import load_dotenv
load_dotenv()
```

---

## ✨ Best Practices Applied

This example follows the best practices outlined in `/cookbook/claude.md`:

### 1. Input Validation
- **TypeScript**: Zod schemas for runtime type checking
- **Python**: Pydantic models for data validation
- Early validation prevents invalid requests

```typescript
// TypeScript validation
export const createAuthSessionParams = z.object({
  username: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
  secret: z.string().min(1, "Secret is required"),
});
```

```python
# Python validation
class CreateAuthSessionParams(BaseModel):
    username: EmailStr
    password: str = Field(..., min_length=8)
    secret: str = Field(..., min_length=16)
```

### 2. Reliable Navigation
Uses `goToUrl` helper with automatic retries:
```typescript
await goToUrl({
  page,
  url: "https://sandbox.intuned.dev/login-otp",
});
```

### 3. Clear Error Handling
Specific error types with context:
```python
except PlaywrightTimeoutError as e:
    raise TimeoutError(f"Auth timed out at {current_url}") from e
except ValueError as e:
    logger.error(f"Validation error: {str(e)}")
    raise
```

### 4. Robust OTP Handling
Multiple retry attempts for timing issues:
```python
# Python refactored version includes:
- 3 OTP attempts
- 30-second wait between attempts
- Success verification
- Clear error messages
```

### 5. Session Verification
Multiple indicators for login success:
```python
# Check multiple success indicators
success_indicators = [
    (AuthSelectors.PRODUCT_GRID, "Product grid"),
    (AuthSelectors.USER_PROFILE, "User profile"),
]
```

### 6. Secure Credential Management
- Never hardcode credentials
- Use environment variables
- Validate secret format
- Clear error messages without exposing secrets

### 7. Comprehensive Documentation
- Docstrings for all functions
- Type hints throughout
- Usage examples
- Parameter descriptions

### 8. Centralized Configuration
```python
# Timeout constants
TIMEOUTS = {
    "navigation": 30_000,
    "network_idle": 10_000,
    "element_visible": 5_000,
    "otp_page": 10_000,
}

# Selector constants
class AuthSelectors:
    EMAIL_INPUT = "#email-input"
    PASSWORD_INPUT = "#password-input"
    # ...
```

---

## 🔧 Troubleshooting

### Common Issues

#### Issue: "OTP verification failed"

**Causes:**
- OTP timing issue (codes expire every 30 seconds)
- Wrong secret key
- System clock out of sync

**Solutions:**
```python
# Python - Use refactored version with retry logic
from auth_sessions.create_refactored import create

# The refactored version automatically:
# - Retries OTP submission up to 3 times
# - Waits for next OTP cycle if timing issue
# - Validates secret format early
```

```typescript
// TypeScript - Add manual retry
for (let attempt = 0; attempt < 3; attempt++) {
  const otpCode = authenticator.generate(secret);
  await otpInput.fill(otpCode);
  await otpSubmitButton.click();

  // Check if successful
  try {
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    break; // Success!
  } catch {
    if (attempt < 2) {
      await page.waitForTimeout(30000); // Wait for next OTP
    }
  }
}
```

#### Issue: "Element not found"

**Causes:**
- Page structure changed
- Slow network/page load
- Wrong selector

**Solutions:**
```typescript
// Add explicit waits
await page.waitForSelector("#email-input", {
  state: "visible",
  timeout: 10000
});
```

```python
# Use verify_and_locate helper (refactored version)
input_field = await verify_and_locate(
    page,
    "#email-input",
    description="Email input field"
)
# Provides detailed error with page context
```

#### Issue: "Session expired"

**Cause:**
- Auth session timed out
- Cookies cleared
- Server-side logout

**Solution:**
```python
# Check and re-authenticate if needed
is_valid = await check(page)
if not is_valid:
    print("Session expired, re-authenticating...")
    await create(page, auth_params)
```

#### Issue: "Invalid TOTP secret"

**Causes:**
- Wrong secret format
- Spaces in secret
- Invalid Base32 encoding

**Solutions:**
```python
# Refactored version validates secret format
# Before attempting authentication
@field_validator('secret')
def validate_secret_format(cls, v: str) -> str:
    try:
        pyotp.TOTP(v)  # Test if valid
        return v
    except Exception as e:
        raise ValueError(f'Invalid TOTP secret: {str(e)}')
```

#### Issue: "Navigation timeout"

**Cause:**
- Slow network
- Server issues
- Wrong URL

**Solutions:**
```typescript
// Use goToUrl with retries (TypeScript)
await goToUrl({
  page,
  url: targetUrl,
  retries: 5,
  timeoutInMs: 60000
});
```

```python
# Use navigate_reliably (Python refactored)
await navigate_reliably(page, url)
# Includes automatic retries with exponential backoff
```

### Debugging Tips

#### Enable Verbose Logging (Python)
```python
import logging

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

#### Run in Non-Headless Mode
```typescript
const browser = await chromium.launch({
  headless: false,
  slowMo: 1000  // Slow down by 1 second
});
```

```python
browser = await p.chromium.launch(
    headless=False,
    slow_mo=1000  # Slow down by 1 second
)
```

#### Take Screenshots on Failure
```python
try:
    await create(page, params)
except Exception as e:
    await page.screenshot(path=f"error_{datetime.now()}.png")
    raise
```

#### Capture Network Requests
```typescript
page.on('request', request => {
  console.log('>>', request.method(), request.url());
});

page.on('response', response => {
  console.log('<<', response.status(), response.url());
});
```

---

## 📚 Additional Resources

### Documentation
- [Intuned Documentation](https://docs.intunedhq.com/)
- [Playwright Documentation](https://playwright.dev/)
- [TOTP Algorithm (RFC 6238)](https://tools.ietf.org/html/rfc6238)

### Helper Libraries
- **TypeScript**:
  - [otplib](https://github.com/yeojz/otplib) - TOTP/HOTP implementation
  - [Zod](https://github.com/colinhacks/zod) - Schema validation
  - [@intuned/browser](https://docs.intunedhq.com/automation-sdks/intuned-sdk/typescript/helpers/functions/) - Intuned helpers

- **Python**:
  - [pyotp](https://github.com/pyauth/pyotp) - TOTP/HOTP implementation
  - [Pydantic](https://docs.pydantic.dev/) - Data validation
  - [Playwright Python](https://playwright.dev/python/) - Browser automation

### Related Examples
- [Basic Authentication Example](../rpa-example/)
- [E-commerce Shopify Example](../e-commerece-shopify/)
- [Quick Recipes](../quick-recipes/)

### Security Resources
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Multi-Factor Authentication Best Practices](https://www.nist.gov/itl/applied-cybersecurity/tig/back-basics-multi-factor-authentication)

---

## 🎓 Learning Path

### Beginner
1. Start with the basic `create.ts` or `create.py` implementation
2. Understand the authentication flow
3. Test with provided credentials on sandbox site
4. Modify timeouts and selectors

### Intermediate
5. Study the `create_refactored.py` version (Python)
6. Implement retry logic in TypeScript version
7. Add custom error handling
8. Create session persistence

### Advanced
9. Implement session cookies storage
10. Add parallel session creation
11. Create session rotation system
12. Build monitoring for session validity
13. Implement rate limiting protection

---

## 🤝 Contributing

Found an issue or have an improvement?

1. Check existing issues first
2. Create a detailed bug report or feature request
3. Include code examples
4. Provide error messages and logs
5. Submit a pull request with tests

---

## 📝 License

This example is part of the Intuned Cookbook and is provided as-is for educational purposes.

---

## 🙋 Support

Need help?
- [Intuned Documentation](https://docs.intunedhq.com/)
- [GitHub Issues](https://github.com/Intuned/cookbook/issues)
- [Community Discord](https://discord.gg/intuned)

---

**Happy Automating! 🚀**
