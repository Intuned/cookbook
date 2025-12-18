# Stagehand with Intuned

This example demonstrates how to integrate [Stagehand](https://docs.stagehand.dev/) with Intuned to create AI-powered browser automation using Python.

## What This Example Does

The `get-books` API demonstrates a practical Stagehand integration that:
1. Navigates to a book store website (https://books.toscrape.com)
2. Uses a Stagehand Computer Use Agent (CUA) with Gemini to navigate to a specific book category (if provided)
3. Extracts structured data about all visible books using Stagehand's extraction capabilities

## How It Works

### Setup Context Hook

The `hooks/setup_context.py` file runs before every API call and bridges Intuned's managed browser with Stagehand.

**Key Points:**
- Connects Stagehand to Intuned's managed browser using CDP (Chrome DevTools Protocol)
- Stores the Stagehand instance in `attempt_store` so it's accessible in your API handlers
- Returns Stagehand's context and page, which replaces Intuned's default Playwright context
- Returns a cleanup function that properly closes Stagehand after the API completes

### API Implementation

The `api/get-books.py` handler receives Stagehand's `page` object and leverages Stagehand's AI capabilities.

**Key Points:**
- Your handler receives Stagehand's `StagehandPage` object
- Retrieve the Stagehand instance from `attempt_store` to create agents
- Stagehand's Computer Use Agent (CUA) uses AI to understand and execute natural language instructions
- Extract structured data with type-safe schemas using Pydantic

## Parameters

The API accepts an optional `category` parameter:

```json
{
  "category": "Travel"  // Optional: specific book category to navigate to
}
```

**Examples:**
- `{ "category": "Travel" }` - Navigates to Travel category and extracts books
- `{}` - Extracts books from the homepage (all categories)

## Getting Started

### Install Dependencies
```bash
uv sync
```

### Run the API Locally
```bash
uv run intuned run api get-books '{"category": "Travel"}'
```

### Deploy to Intuned
```bash
uv run intuned deploy
```

## Project Structure
```
/
├── api/
│   └── get-books.py          # Main API handler
├── hooks/
│   └── setup_context.py      # Stagehand integration setup
├── ____testParameters/
│   └── get-books.json        # Test parameters
├── Intuned.jsonc             # Intuned project configuration
└── pyproject.toml            # Dependencies
```

## Learn More

- **Stagehand Documentation**: https://docs.stagehand.dev/
- **Intuned Runtime SDK**: https://docs.intunedhq.com/docs/05-references/runtime-sdk-python/overview
- **Setup Hooks**: https://docs.intunedhq.com/docs/01-learn/recipes/setup-hooks
- **Intuned Concepts**: https://docs.intunedhq.com/docs/00-getting-started/introduction
