# Captcha Solving with Auth Sessions Example

This example demonstrates how to build a web scraper that automatically solves Cloudflare Turnstile captchas using Intuned's captcha solver, combined with authenticated sessions for protected content.

## Features

- **Cloudflare Turnstile Solving**: Automatically solves Cloudflare Turnstile captchas during authentication
- **Auth Sessions**: Maintains authenticated state across multiple API calls
- **Product Scraping**: Scrapes product information from protected e-commerce pages
- **Two APIs**:
  - `list`: Lists all products from the dashboard
  - `details`: Gets detailed information for a specific product

## Prerequisites

- Node.js and npm/yarn installed
- Intuned account with captcha solver enabled
- Intuned API key set in `.env` file

## Getting Started

### 1. Install Dependencies

```bash
# Using npm
npm install

# Using yarn
yarn
```

### 2. Configure Environment

Create a `.env` file in the project root:

```bash
INTUNED_API_KEY=your_api_key_here
```

### 3. Test Locally

Run APIs locally with test parameters:

```bash
# Test the list API (uses .parameters/api/list/default.json)
yarn intuned run api list

# Test the details API (uses .parameters/api/details/default.json)
yarn intuned run api details

# Test with custom parameters
yarn intuned run api details '{"name":"Product Name","price":"$50","details_url_item":"https://scrapingcourse.com/ecommerce/product/example"}'
```

### 4. Deploy to Intuned

```bash
yarn intuned deploy
```

## Project Structure

```
captcha-solving-auth-example/
├── api/                          # API endpoints
│   ├── details.ts               # Get product details
│   └── list.ts                  # List all products
├── auth-sessions/               # Authentication handlers
│   ├── create.ts               # Create auth session (handles captcha)
│   └── check.ts                # Validate auth session
├── .parameters/                 # Test parameters
│   ├── api/
│   │   ├── details/
│   │   │   └── default.json
│   │   └── list/
│   │       └── default.json
│   └── auth/
│       ├── create/
│       │   └── default.json
│       └── check/
│           └── default.json
├── Intuned.jsonc               # Project configuration
├── .env                        # Environment variables (not tracked)
└── package.json
```

## Envs

This project uses environment variables for configuration. Create a `.env` file with:

```bash
# Required: Your Intuned API key for authentication
INTUNED_API_KEY=your_api_key_here
```

## Auth Sessions

This project uses **API-based auth sessions** to handle authentication with captcha solving.

### How It Works

1. **create.ts**: Navigates to login page, fills credentials, waits for captcha to be solved automatically, and submits the form
2. **check.ts**: Validates the session by checking if the user is still logged in
3. Auth state is preserved across API calls, eliminating the need to re-authenticate for each request

### Testing Auth Session Creation

```bash
# Test creating an auth session with default credentials (uses .parameters/auth/create/default.json)
yarn intuned run auth-session create

# Test with custom credentials
yarn intuned run auth-session create '{"email":"user@example.com","password":"pass123"}'
```

Learn more about Auth Sessions: https://docs.intunedhq.com/docs/02-features/auth-sessions

## API Examples

### List Products

Scrapes all products from the dashboard:

```bash
# Uses .parameters/api/list/default.json
yarn intuned run api list
```

### Get Product Details

Scrapes detailed information for a specific product:

```bash
# Uses .parameters/api/details/default.json
yarn intuned run api details

# Or with custom parameters
yarn intuned run api details '{"name":"Mach Street Sweatshirt","price":"$62","details_url_item":"https://scrapingcourse.com/ecommerce/product/mach-street-sweatshirt"}'
```

## Captcha Solver Configuration

The `Intuned.jsonc` file includes captcha solver settings:

```jsonc
{
  "captchaSolver": {
    "enabled": true,
    "cloudflare": {
      "enabled": true
    },
    "settings": {
      "autoSolve": true,
      "maxRetries": 4
    }
  }
}
```

- **autoSolve**: Automatically detects and solves captchas
- **maxRetries**: Number of retry attempts if captcha solving fails
- **cloudflare.enabled**: Specifically enables Cloudflare Turnstile solving

## Development Commands

```bash
# Install dependencies
yarn

# Run an API locally
yarn intuned run api <api-name> [parameters]

# Create/test auth session
yarn intuned run auth-session create [parameters]

# Deploy to Intuned cloud
yarn intuned deploy

# Get help on any command
yarn intuned --help
yarn intuned run --help
```

## Key Implementation Details

### Captcha Handling in create.ts

```typescript
import { waitForCaptchaSolve } from "@intuned/runtime";

// Fill login credentials
await page.locator("#email").fill(params.email);
await page.locator("#password").fill(params.password);

// Wait for captcha to be automatically solved
await waitForCaptchaSolve(page, {
  timeoutInMs: 30_000,
  settlePeriodInMs: 10_000,
});

// Submit the form
await page.locator("#submit-button").click();
```

The `waitForCaptchaSolve` function:
- Detects when a captcha is present
- Waits for the captcha solver to complete
- Has configurable timeout and settle period
- Automatically retries based on `maxRetries` config

### Session Validation in check.ts

```typescript
export default async function check(
  page: Page,
  context: BrowserContext
): Promise<boolean> {
  await goToUrl({
    page,
    url: "https://www.scrapingcourse.com/dashboard",
  });

  return await page.getByText("Logout").isVisible();
}
```

## Resources

- [Intuned Documentation](https://docs.intunedhq.com)
- [Browser SDK Reference](https://docs.intunedhq.com/automation-sdks/intuned-sdk/overview)
- [Auth Sessions Guide](https://docs.intunedhq.com/docs/02-features/auth-sessions)
- [Captcha Solving Documentation](https://docs.intunedhq.com/docs/02-features/captcha-solving)
- [Recipe: Captcha Solving](https://docs.intunedhq.com/docs/01-learn/recipes/captcha-solving)
