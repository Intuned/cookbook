# Stagehand Template

A template for building browser automations using [Stagehand](https://github.com/browserbase/stagehand) with Intuned. This project demonstrates how to integrate Stagehand's AI-powered agent capabilities with Intuned's browser automation infrastructure for intelligent web interaction and data extraction.

## Overview

This template showcases:
- AI-powered web navigation using Stagehand agents
- Intelligent data extraction with structured schemas
- Integration with Intuned's managed browser infrastructure
- Custom context setup for Stagehand within Intuned
- Automatic AI Gateway configuration (no API keys required)

## Project Structure

```
/
├── api/                      # Your API endpoints
│   └── getStockDetails.ts   # Example API using Stagehand agent
├── hooks/                    # Lifecycle hooks
│   └── setupContext.ts      # Stagehand initialization hook
├── .parameters/              # Test parameters for local development
│   └── getStockDetails/
│       └── default.json     # Default parameters for getStockDetails API
└── Intuned.jsonc            # Intuned project configuration
```

## Example: Stock Details Extraction

The `getStockDetails.ts` API demonstrates Stagehand's capabilities:

```typescript
import { Stagehand } from "@browserbasehq/stagehand";
import { getAiGatewayConfig } from "@intuned/runtime";

// Get AI Gateway configuration (no API keys needed!)
const { baseUrl, apiKey } = await getAiGatewayConfig();

// Use Stagehand agent to intelligently navigate and find information
const agent = stagehand.agent({
  modelName: "claude-sonnet-4-5",
  modelClientOptions: {
    apiKey,
    baseURL: baseUrl,
  },
});
await agent.execute({
  instruction: `Find and open the page on one stock based on the following criteria: ${criteria}.`,
});

// Extract structured data using AI
const stockDetails = await stagehand.extract(
  "Extract the stock details from the page",
  stockDetailsSchema,
  {
    page: page,
    modelName: "claude-sonnet-4-5",
    modelClientOptions: {
      apiKey,
      baseURL: baseUrl,
    },
  }
);
```

## AI Gateway Integration

This template uses Intuned's AI Gateway, which means **you don't need to provide your own Anthropic or OpenAI API keys**. The `getAiGatewayConfig()` function from `@intuned/runtime` automatically provides a temporary AI gateway with the necessary credentials.

This makes it easy to:
- Get started quickly without setting up API keys
- Run AI-powered automations without additional costs
- Test and develop Stagehand agents seamlessly

## Getting Started

To get started developing browser automation projects with Intuned, check out our [concepts and terminology](https://docs.intunedhq.com/docs/getting-started/conceptual-guides/core-concepts#runs%3A-executing-your-automations).

### Install dependencies

```bash
# npm
npm install

# yarn
yarn
```

> **Note:** If you are using `npm`, make sure to pass `--` when using options with the `intuned` command.

### Run an API

```bash
# npm
npm run intuned run api getStockDetails

# yarn
yarn intuned run api getStockDetails
```

The API will use the default parameters from `.parameters/getStockDetails/default.json`. You can also pass parameters inline:

```bash
# npm
npm run intuned run api getStockDetails -- --parameters '{"criteria": "highest volume stock today"}'

# yarn
yarn intuned run api getStockDetails --parameters '{"criteria": "highest volume stock today"}'
```

### Deploy project

```bash
# npm
npm run intuned deploy

# yarn
yarn intuned deploy
```

## About Stagehand

[Stagehand](https://github.com/browserbase/stagehand) is an AI-powered browser automation framework that allows you to:
- Use natural language instructions for web navigation
- Extract structured data with AI-powered understanding
- Build resilient automations that adapt to page changes

## About Intuned Runtime SDK

All Intuned projects use the Intuned runtime SDK (`@intuned/runtime`). This project uses:

- **`setupContext` hook**: Initializes the Stagehand instance with Intuned's managed browser
- **`attemptStore`**: Stores and retrieves the Stagehand instance across API calls
- **`getAiGatewayConfig`**: Provides automatic AI Gateway credentials (no API keys required)

For more information, check out the [Intuned documentation](https://docs.intunedhq.com).

## Learn More

- [Intuned Documentation](https://docs.intunedhq.com/docs/00-getting-started/introduction)
- [Stagehand GitHub Repository](https://github.com/browserbase/stagehand)
- [Intuned.json Reference](https://docs.intunedhq.com/docs/05-references/intuned-json)
