# Browser Use with Intuned

This example demonstrates how to integrate [Browser Use](https://github.com/browser-use/browser-use) with Intuned to create AI-powered browser automation.

## Run on Intuned

[![Run on Intuned](https://cdn1.intuned.io/button.svg)](https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/browser-use)

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

## Getting Started

**Important:** This example uses [Browser Use](https://github.com/browser-use/browser-use), an AI-powered browser automation tool that requires Intuned's AI gateway. The AI gateway requires the project to be saved before running.

### Setup

To run this example locally, you need to set up your Intuned workspace:

1. **Create a workspace** - Follow the [workspace management guide](https://docs.intunedhq.com/docs/03-how-to/manage/manage-workspace) to create your Intuned workspace

2. **Get your API key** - Generate an API key from the [API keys page](https://docs.intunedhq.com/docs/03-how-to/manage/manage-api-keys#how-to-manage-api-keys) in your Intuned dashboard

3. **Configure workspace ID** - Add your workspace ID and Project Name to `Intuned.jsonc`:
   ```jsonc
   {
     "workspaceId": "your-workspace-id",
     "projectName": "your-project-name"
     // ... rest of config
   }
   ```

4. **Set environment variable** - Add your API key as an environment variable:
   ```bash
   export INTUNED_API_KEY=your-api-key
   ```

### Install Dependencies
```bash
uv sync
```

### Initialize Project

Run the save command to upload your project and set up the required `.env` file:

```bash
uv run intuned save
```

This configures your local environment and prepares the AI gateway for Browser Use.

Reference for saving project [here](https://docs.intunedhq.com/docs/02-features/local-development-cli#use-runtime-sdk-and-browser-sdk-helpers)

### Run the API Locally
```bash
uv run intuned run api purchase-item .parameters/api/purchase-item/default.json
```

### Deploy to Intuned
```bash
uv run intuned deploy
```

## Project Structure
```
/
├── api/
│   └── purchase-item.py          # Main API handler
├── hooks/
│   └── setup_context.py      # Browser Use integration setup
├── .parameters/api/
│   └── purchase-item/
│       └── default.json          # Test parameters
├── Intuned.jsonc             # Intuned project configuration
└── pyproject.toml            # Dependencies
```

## Learn More

- **Browser Use Documentation**: https://github.com/browser-use/browser-use
- **Intuned Runtime SDK**: https://docs.intunedhq.com/docs/05-references/runtime-sdk-python/overview
- **Setup Hooks**: https://docs.intunedhq.com/docs/01-learn/recipes/setup-hooks
- **Intuned Concepts**: https://docs.intunedhq.com/docs/00-getting-started/introduction
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
