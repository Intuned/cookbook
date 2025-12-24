# Stagehand with Intuned

This example demonstrates how to integrate [Stagehand](https://docs.stagehand.dev/) with Intuned to create AI-powered browser automation.

<!-- IDE-IGNORE-START -->
## Run on Intuned

Open this project in Intuned by clicking the button below.

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/stagehand" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>
<!-- IDE-IGNORE-END -->

## What This Example Does

The `get-books` API demonstrates a practical Stagehand integration that:
1. Navigates to a book store website (https://books.toscrape.com)
2. Uses Stagehand's AI-powered `act()` and `observe()` methods to navigate to a specific book category (if provided)
3. Extracts structured data about all visible books using Stagehand's `extract()` method with type-safe Zod schemas
4. Automatically paginates through multiple pages to collect all books

## How It Works

### Setup Context Hook

The `hooks/setupContext.ts` file runs before every API call and stores the CDP URL for Stagehand initialization.

**Key Points:**
- Stores the CDP (Chrome DevTools Protocol) URL in `attemptStore` for later use
- The API handler then uses this CDP URL to initialize Stagehand and connect to Intuned's managed browser
- This allows Stagehand to control the same browser instance managed by Intuned

### API Implementation

The `api/get-books.ts` handler receives Intuned's Playwright `page` object and leverages Stagehand's AI capabilities.

**Key Points:**
- Initialize Stagehand with the CDP URL from `attemptStore` and Intuned's AI Gateway credentials
- Pass Intuned's Playwright `page` to Stagehand's agent and extract methods (see [Stagehand's Playwright Integration](https://docs.stagehand.dev/v3/integrations/playwright))
- Use `stagehand.page.observe()` to locate elements using natural language
- Use `stagehand.page.act()` to perform actions using natural language instructions
- Use `stagehand.page.extract()` to extract structured data with type-safe Zod schemas

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
# npm
npm install

# yarn
yarn
```

### Run an API

```bash
# npm
npm run intuned run api get-books .parameters/api/get-books/travel-category.json
npm run intuned run api get-books .parameters/api/get-books/no-category-all-books.json

# yarn
yarn intuned run api get-books .parameters/api/get-books/travel-category.json
yarn intuned run api get-books .parameters/api/get-books/no-category-all-books.json
```

### Deploy to Intuned
```bash
# npm
npm run intuned deploy

# yarn
yarn intuned deploy
```
<!-- IDE-IGNORE-END -->

## Project Structure
```
/
├── api/
│   └── get-books.ts          # Main API handler
├── hooks/
│   └── setupContext.ts       # Stores CDP URL for Stagehand
├── .parameters/
│   └── api/
│       └── get-books/
│           ├── travel-category.json           # Travel category example
│           └── no-category-all-books.json     # No category specified
├── Intuned.jsonc             # Intuned project configuration
└── package.json              # Dependencies
```

## Learn More

- **Intuned Concepts**: https://docs.intunedhq.com/docs/00-getting-started/introduction
- **Stagehand Documentation**: https://docs.stagehand.dev/
- **Intuned Runtime SDK**: https://docs.intunedhq.com/automation-sdks/intuned-sdk/overview
- **Setup Hooks**: https://docs.intunedhq.com/docs/01-learn/recipes/setup-hooks
