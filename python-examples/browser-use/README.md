# Browser Use with Intuned

This example demonstrates how to integrate [Browser Use](https://github.com/browser-use/browser-use) with Intuned to create AI-powered browser automation.

## What This Example Does

The `book-room` API demonstrates a practical Browser Use integration that automates an e-commerce checkout flow:
1. Navigates to an e-commerce website (saucedemo.com)
2. Logs in with provided credentials
3. Uses a Browser Use AI agent to search for a product and add it to cart
4. Completes the checkout process with provided shipping information

## How It Works

### Setup Context Hook

The `hooks/setup_context.py` file runs before every API call and creates a Browser Use browser instance.

**Key Points:**
- Creates a Browser Use `Browser` instance using Intuned's CDP URL
- Stores the Browser Use instance in `attempt_store` so it's accessible in your API handlers
- Browser Use operates independently via CDP on Intuned's managed browser

### API Implementation

The `api/book-room.py` handler receives Intuned's Playwright `page` object and also uses the Browser Use browser.
## Parameters

The API requires the following parameters:

```json
{
  "username": "standard_user",
  "password": "secret_sauce",
  "product_name": "Sauce Labs Backpack",
  "first_name": "John",
  "last_name": "Doe",
  "zip_code": "12345"
}
```

## Getting Started

### Install Dependencies
```bash
uv sync
```

### Run the API Locally
```bash
uv run intuned run api book-room '{"username":"standard_user","password":"secret_sauce","product_name":"Sauce Labs Backpack","first_name":"John","last_name":"Doe","zip_code":"12345"}'
```

### Deploy to Intuned
```bash
uv run intuned deploy
```

## Project Structure
```
/
├── api/
│   └── book-room.py          # Main API handler
├── hooks/
│   └── setup_context.py      # Browser Use integration setup
├── ____testParameters/
│   └── book-room.json        # Test parameters
├── Intuned.jsonc             # Intuned project configuration
└── pyproject.toml            # Dependencies
```

## Learn More

- **Browser Use Documentation**: https://github.com/browser-use/browser-use
- **Intuned Runtime SDK**: https://docs.intunedhq.com/docs/05-references/runtime-sdk-python/overview
- **Attempt_Store**: https://docs.intunedhq.com/docs/05-references/runtime-sdk-python/attempt-store
- **Intuned Concepts**: https://docs.intunedhq.com/docs/00-getting-started/introduction
