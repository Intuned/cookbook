# Stagehand with Intuned

This example demonstrates how to integrate [Stagehand](https://docs.stagehand.dev/) with Intuned to create AI-powered browser automation.

## What This Example Does

The `getBooks` API demonstrates a practical Stagehand integration that:
1. Navigates to a book store website (https://books.toscrape.com)
2. Uses a Stagehand AI agent to navigate to a specific book category (if provided)
3. Extracts structured data about all visible books using Stagehand's extraction capabilities

## How It Works

### Setup Context Hook

The `hooks/setupContext.ts` file runs before every API call and bridges Intuned's managed browser with Stagehand.

**Key Points:**
- Connects Stagehand to Intuned's managed browser using CDP (Chrome DevTools Protocol)
- Stores the Stagehand instance in `attemptStore` so it's accessible in your API handlers
- Returns a cleanup function that properly closes Stagehand after the API completes

### API Implementation

The `api/getBooks.ts` handler receives Intuned's Playwright `page` object but can leverage Stagehand's AI capabilities

**Key Points:**
- Your handler receives Playwright's `page` object from Intuned
- Retrieve the Stagehand instance from `attemptStore`
- Pass the Playwright `page` to Stagehand's agent and extract methods. Look at [Stagehand's Playwright Integration](https://docs.stagehand.dev/v3/integrations/playwright)
- Stagehand's agent uses AI to understand and execute natural language instructions
- Extract structured data with type-safe schemas using Zod

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
# npm
npm install

# yarn
yarn
```

### Run the API Locally
```bash
# npm
npm run intuned run api getBooks '{"category": "Travel"}'

# yarn
yarn intuned run api getBooks '{"category": "Travel"}'
```

### Deploy to Intuned
```bash
# npm
npm run intuned deploy

# yarn
yarn intuned deploy
```

## Project Structure
```
/
├── api/
│   └── getBooks.ts           # Main API handler
├── hooks/
│   └── setupContext.ts       # Stagehand integration setup
├── ____testParameters/
│   └── getBooks.json         # Test parameters
├── Intuned.jsonc             # Intuned project configuration
└── package.json              # Dependencies
```

## Learn More

- **Stagehand Documentation**: https://docs.stagehand.dev/
- **Intuned Runtime SDK**: https://docs.intunedhq.com/docs/05-references/runtime-sdk-python/overview
- **Attempt_Store**: https://docs.intunedhq.com/docs/05-references/runtime-sdk-python/attempt-store
- **Intuned Concepts**: https://docs.intunedhq.com/docs/00-getting-started/introduction