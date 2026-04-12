# E-Commerce Shopify (TypeScript)

Shopify store product scraper.

<!-- IDE-IGNORE-START -->
## Run on Intuned

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/e-commerce-shopify" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>
<!-- IDE-IGNORE-END -->

## APIs

| API | Description |
| --- | ----------- |
| `shopify-list` | Lists all products from a Shopify store using pagination. Extracts product handles, titles, and basic information via Shopify's JSON API |
| `shopify-details` | Fetches comprehensive product details including variants, images, pricing, and availability for a specific product |

<!-- IDE-IGNORE-START -->
## Getting started

### Install dependencies

```bash
npm install
# or
yarn
```

If the `intuned` CLI is not installed, install it globally:

```bash
npm install -g @intuned/cli
```

After installing dependencies, `intuned` command should be available in your environment.

### Run an API

```bash
intuned dev run api shopify-list .parameters/api/shopify-list/default.json
intuned dev run api shopify-details .parameters/api/shopify-details/default.json
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

## Project structure

```text
/
├── api/
│   ├── shopify-list.ts      # List all products from Shopify store
│   └── shopify-details.ts   # Get detailed product information
├── intuned-resources/
│   └── jobs/
│       └── shopify-list.job.jsonc    # Top-level job example for the product list flow
├── .parameters/api/         # Test parameters
├── Intuned.jsonc            # Project config
├── package.json             # Node.js dependencies
└── README.md
```

## Key features

- **Shopify JSON API integration**: Uses Shopify's public JSON API endpoints for efficient data extraction
- **Pagination support**: Automatically handles pagination to scrape all products from large stores
- **Zero browser overhead**: API-based scraping without browser automation overhead
- **Detailed product data**: Extracts comprehensive product information including variants, images, and pricing

## Related

- [Intuned CLI](https://intunedhq.com/docs/main/05-references/cli/overview)
- [Intuned Browser SDK](https://intunedhq.com/docs/automation-sdks/overview)
- [Shopify API Documentation](https://shopify.dev/docs/api)
- [Web Scraping Recipe](https://intunedhq.com/docs/main/01-learn/recipes/)
- [Intuned llm.txt](https://intunedhq.com/docs/llms.txt)
