# e-commerce-shopify Intuned project

Shopify store scraper to list all products and fetch detailed product information from any Shopify store using the JSON API.

## Key Features

- **Shopify JSON API Integration**: Uses Shopify's public JSON API endpoints for efficient data extraction
- **Pagination Support**: Automatically handles pagination to scrape all products from large stores
- **Zero Browser Overhead**: API-based scraping without browser automation overhead
- **Detailed Product Data**: Extracts comprehensive product information including variants, images, and pricing

<!-- IDE-IGNORE-START -->
## Run on Intuned

[![Run on Intuned](https://cdn1.intuned.io/button.svg)](https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/e-commerce-shopify)

## Getting Started

To get started developing browser automation projects with Intuned, check out our [concepts and terminology](https://docs.intunedhq.com/docs/getting-started/conceptual-guides/core-concepts#runs%3A-executing-your-automations).


## Development

> **_NOTE:_**  All commands support `--help` flag to get more information about the command and its arguments and options.

### Install dependencies
```bash
# npm
npm install

# yarn
yarn
```

> **_NOTE:_**  If you are using `npm`, make sure to pass `--` when using options with the `intuned` command.


### Run an API
```bash
# npm
npm run intuned run api shopify-list .parameters/api/shopify-list/default.json
npm run intuned run api shopify-details .parameters/api/shopify-details/default.json

# yarn
yarn intuned run api shopify-list .parameters/api/shopify-list/default.json
yarn intuned run api shopify-details .parameters/api/shopify-details/default.json
```

### Save project
```bash
# npm
npm run intuned run save

# yarn
yarn intuned run save
```

Reference for saving project [here](https://docs.intunedhq.com/docs/02-features/local-development-cli#use-runtime-sdk-and-browser-sdk-helpers)

### Deploy project
```bash
# npm
npm run intuned deploy

# yarn
yarn intuned deploy
```

### `@intuned/browser`: Intuned Browser SDK

This project uses Intuned browser SDK. For more information, check out the [Intuned Browser SDK documentation](https://docs.intunedhq.com/automation-sdks/overview).

<!-- IDE-IGNORE-END -->




## Project Structure
```
/
├── .parameters/              # Test parameters for APIs
│   └── api/
│       ├── shopify-list/
│       │   └── default.json
│       └── shopify-details/
│           └── default.json
├── api/                      # API endpoints
│   ├── shopify-list.ts      # List all products from Shopify store
│   └── shopify-details.ts   # Get detailed product information
├── Intuned.jsonc            # Intuned project configuration
└── package.json             # Node.js project dependencies
```


## APIs

| API | Description |
|-----|-------------|
| `shopify-list` | Lists all products from a Shopify store using pagination. Extracts product handles, titles, and basic information via Shopify's JSON API |
| `shopify-details` | Fetches comprehensive product details including variants, images, pricing, and availability for a specific product |


## Learn More

- [Intuned Documentation](https://docs.intunedhq.com)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [Shopify API Documentation](https://shopify.dev/docs/api)
- [Web Scraping Recipe](https://docs.intunedhq.com/docs/01-learn/recipes/)
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
