# Shopify Store Scraper

Shopify store scraper to list all products and fetch detailed product information from any Shopify store using the JSON API.

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
npm run intuned run api <api-name> <parameters>

# yarn
yarn intuned run api <api-name> <parameters>
```

#### Example: List Products from Shopify Store

```bash
# Using default parameters from .parameters/shopify-list/default.json
yarn intuned run api shopify-list -p .parameters/shopify-list/default.json

# Using inline parameters - List products with default page limit (10)
yarn intuned run api shopify-list '{"store_url": "https://the-outrage.com"}'

# Using inline parameters - List products with custom page limit
yarn intuned run api shopify-list '{"store_url": "https://the-outrage.com", "maxPages": 5}'
```

#### Example: Get Product Details

```bash
# Using default parameters from .parameters/shopify-details/default.json
yarn intuned run api shopify-details -p .parameters/shopify-details/default.json

# Using inline parameters - Get details for a specific product
yarn intuned run api shopify-details '{"name": "Product Name", "vendor": "Vendor Name", "product_type": "Type", "tags": ["tag1"], "details_url": "https://the-outrage.com/products/example-product"}'
```

### Deploy project
```bash
# npm
npm run intuned deploy

# yarn
yarn intuned deploy
```


## Project Structure
The project structure is as follows:
```
/
├── api/                      # Your API endpoints
│   ├── shopify-list.ts       # API to list all products from a Shopify store
│   └── shopify-details.ts    # API to fetch detailed product information
├── .parameters/              # Test parameters for APIs
│   ├── shopify-list/
│   │   └── default.json      # Default parameters for shopify-list API
│   └── shopify-details/
│       └── default.json      # Default parameters for shopify-details API
├── utils/                    # Utility files
│   └── typesAndSchemas.ts   # TypeScript types and Zod schemas
└── Intuned.jsonc             # Intuned project configuration file
```


## APIs

### `shopify-list` - Product List Scraper

Scrapes all products from any Shopify store using the JSON API with pagination support.

**Parameters:**
- `store_url` (required): The Shopify store URL (e.g., "https://the-outrage.com")
- `maxPages` (optional): Maximum number of pages to scrape (default: 10)

**Returns:**
Array of products with:
- `name`: Product name
- `vendor`: Product vendor/brand
- `product_type`: Product type/category
- `tags`: Array of product tags
- `details_url`: URL to product details page

**Features:**
- Automatic pagination handling (250 products per page)
- Triggers `shopify-details` API for each product using `extendPayload`
- Works with any Shopify store

### `shopify-details` - Product Details Scraper

Fetches detailed information for a specific product using Shopify's JSON API.

**Parameters:**
- `name`: Product name
- `vendor`: Product vendor
- `product_type`: Product type
- `tags`: Array of product tags
- `details_url`: URL to the product details page

**Returns:**
Product details object with:
- `source_url`: Product details URL
- `id`: Product ID
- `name`: Product name
- `handle`: Product handle (URL slug)
- `vendor`: Product vendor
- `product_type`: Product type
- `tags`: Array of product tags
- `description`: Product description (HTML stripped)
- `price`: Product price
- `images`: Array of product image URLs
- `options`: Array of product options
- `variants`: Array of product variants with SKU, price, availability, and inventory


## Envs

This project doesn't require any environment variables for basic usage. If you need to configure API keys or other settings for deployment, create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Then edit `.env` with your actual values:
- `INTUNED_API_KEY`: Your Intuned API key (required for deployment and API calls)


## `Intuned.jsonc` Reference
```jsonc
{
  // API access settings
  "apiAccess": {
    // Whether to enable consumption through Intuned API
    "enabled": true
  },

  // Auth session settings
  "authSessions": {
    // Auth sessions are not used in this project
    "enabled": false
  },

  // Replication settings
  "replication": {
    // The maximum number of concurrent executions allowed via Intuned API
    "maxConcurrentRequests": 1,

    // The machine size to use for this project
    // "standard": Standard machine size (6 shared vCPUs, 2GB RAM)
    // "large": Large machine size (8 shared vCPUs, 4GB RAM)
    // "xlarge": Extra large machine size (1 performance vCPU, 8GB RAM)
    "size": "standard"
  },

  // Default job configuration
  "metadata": {
    "template": {
      "name": "Shopify Store Scraper",
      "description": "Shopify store scraper to list all products and fetch detailed product information from any Shopify store using the JSON API"
    },
    "defaultJobInput": {
      "configuration": {
        // Number of concurrent API calls within the job
        "maxConcurrentRequests": 2,
        // Retry configuration
        "retry": {
          "maximumAttempts": 3
        }
      },
      "payload": [
        {
          "apiName": "shopify-list",
          "parameters": {
            "store_url": "https://the-outrage.com",
            "maxPages": 10
          }
        }
      ]
    }
  }
}
```

## Using `@intuned/browser` SDK

This project uses the Intuned browser SDK for enhanced reliability:

- **`goToUrl`**: Navigate to URLs with automatic retries and intelligent timeout detection
- **`extendPayload`**: Trigger additional API calls dynamically (used to trigger `shopify-details` API for each product)

For more information, check out the [Intuned Browser SDK documentation](https://docs.intunedhq.com/automation-sdks/intuned-sdk/overview).
