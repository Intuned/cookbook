# Browser Use with Intuned

This example demonstrates how to integrate [Browser Use](https://github.com/browser-use/browser-use) with Intuned to create AI-powered browser automation.

<!-- IDE-IGNORE-START -->
## Run on Intuned

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/browser-use" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>
<!-- IDE-IGNORE-END -->

## What This Example Does

The `purchase-item` API demonstrates a practical Browser Use integration that automates an e-commerce checkout flow:

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

The `api/purchase-item.py` handler receives Intuned's Playwright `page` object and also uses the Browser Use browser.

## Parameters

The API template example uses the following parameters:

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

<!-- IDE-IGNORE-START -->
## Getting Started

### Install dependencies

```bash
uv sync
```

If the `intuned` CLI is not installed, install it globally:

```bash
npm install -g @intuned/cli
```

After installing dependencies, `intuned` command should be available in your environment.

### Run an API

```bash
intuned dev run api purchase-item .parameters/api/purchase-item/default.json
```

### Save project

```bash
intuned dev provision
```

### Deploy

```bash
intuned dev deploy
```
<!-- IDE-IGNORE-END -->

## Project Structure

```text
/
├── api/
│   └── purchase-item.py          # Main API handler
├── hooks/
│   └── setup_context.py      # Browser Use integration setup
├── intuned-resources/
│   └── jobs/
│       └── purchase-item.job.jsonc  # Job for purchase-item API
├── .parameters/api/
│   └── purchase-item/
│       └── default.json          # Test parameters
├── Intuned.jsonc             # Intuned project configuration
└── pyproject.toml            # Dependencies
```

## Related

- [Intuned CLI](https://docs.intunedhq.com/docs/05-references/cli/overview)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- **Browser Use Documentation**: <https://github.com/browser-use/browser-use>
- **Setup Hooks**: <https://docs.intunedhq.com/docs/01-learn/recipes/setup-hooks>
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
