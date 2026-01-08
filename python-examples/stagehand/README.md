# Stagehand with Intuned

This example demonstrates how to integrate [Stagehand](https://docs.stagehand.dev/) with Intuned to create AI-powered browser automation using Python.
<!-- IDE-IGNORE-START -->
## Run on Intuned

Open this project in Intuned by clicking the button below.

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/stagehand" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>
<!-- IDE-IGNORE-END -->

## What This Example Does

The `get-books` API demonstrates a practical Stagehand integration that:
1. Navigates to a book store website (https://books.toscrape.com)
2. Uses Stagehand's AI-powered `act()` and `observe()` methods to navigate to a specific book category (if provided)
3. Extracts structured data about all visible books using Stagehand's `extract()` method with type-safe Pydantic schemas
4. Automatically paginate through multiple pages to collect all books

## How It Works

### Setup Context Hook

The `hooks/setup_context.py` file runs before every API call and stores the CDP URL for Stagehand initialization.

**Key Points:**
- Stores the CDP (Chrome DevTools Protocol) URL in `attempt_store` for later use
- The API handler then uses this CDP URL to initialize Stagehand and connect to Intuned's managed browser
- This allows Stagehand to control the same browser instance managed by Intuned

### API Implementation

The `api/get-books.py` handler receives Stagehand's `page` object and leverages Stagehand's AI capabilities.

**Key Points:**
- Initialize Stagehand with the CDP URL from `attempt_store` and Intuned's AI Gateway credentials
- Use `stagehand.page.observe()` to locate elements using natural language
- Use `stagehand.page.act()` to perform actions using natural language instructions
- Use `stagehand.page.extract()` to extract structured data with type-safe Pydantic schemas

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

<!-- IDE-IGNORE-START -->
## Getting Started

### Install Dependencies
```bash
uv sync
```

### Run an API

```bash
uv run intuned run api get-books .parameters/api/get-books/travel-category.json
uv run intuned run api get-books .parameters/api/get-books/no-category-all-books.json
```

### Deploy to Intuned
```bash
uv run intuned deploy
```
<!-- IDE-IGNORE-END -->

## Project Structure
```
/
├── api/
│   └── get-books.py          # Main API handler
├── hooks/
│   └── setup_context.py      # Stores CDP URL for Stagehand
├── .parameters/
│   └── api/
│       └── get-books/
│           ├── travel-category.json      # Travel category example
│           └── no-category-all-books.json # No category specified
├── Intuned.jsonc             # Intuned project configuration
└── pyproject.toml            # Dependencies
```

## Learn More

- **Intuned Concepts**: https://docs.intunedhq.com/docs/00-getting-started/introduction
- **Stagehand Documentation**: https://docs.stagehand.dev/
- **Intuned Runtime SDK**: https://docs.intunedhq.com/docs/05-references/runtime-sdk-python/overview
- **Setup Hooks**: https://docs.intunedhq.com/docs/01-learn/recipes/setup-hooks
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
