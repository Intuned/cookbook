# E-Commerce Product Scraper

E-commerce scraping automation that extracts product information from an online store with pagination support.

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

#### Example: List Products

```bash
# List products with default parameters
yarn intuned run api list

# List products with custom page limit
yarn intuned run api list '{"limit": 5}'

# List all products (up to 50 pages)
yarn intuned run api list '{"limit": 50}'
```

#### Example: Get Product Details

```bash
# Get details using default parameters
yarn intuned run api details

# Get details for a specific product
yarn intuned run api details '{"name": "Abominable Hoodie", "detailsUrl": "https://www.scrapingcourse.com/ecommerce/product/abominable-hoodie"}'

# Get details for another product
yarn intuned run api details '{"name": "Chaz Kangeroo Hoodie", "detailsUrl": "https://www.scrapingcourse.com/ecommerce/product/chaz-kangeroo-hoodie"}'
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
│   ├── list.ts              # API to scrape product list with pagination
│   └── details.ts           # API to scrape detailed product information
├── utils/                    # Utility files
│   └── typesAndSchemas.ts   # TypeScript types and Zod schemas
├── .parameters/              # Default parameter files for testing
│   ├── list/
│   │   └── default.json     # Default parameters for list API
│   └── details/
│       └── default.json     # Default parameters for details API
└── Intuned.jsonc             # Intuned project configuration file
```


## APIs

### `list` - Product List Scraper

Scrapes products from the e-commerce store with pagination support.

**Parameters:**
- `limit` (optional): Maximum number of pages to scrape (default: 50)

**Returns:**
Array of products with:
- `name`: Product name
- `detailsUrl`: URL to product details page

**Features:**
- Automatic pagination handling
- Triggers `details` API for each product using `extendPayload`
- Configurable page limit

### `details` - Product Details Scraper

Scrapes detailed information for a specific product.

**Parameters:**
- `name`: Product name
- `detailsUrl`: URL to the product details page

**Returns:**
Product details object with:
- `name`: Product name
- `price`: Product price
- `id`: Product ID (SKU)
- `category`: Product category
- `shortDescription`: Brief product description
- `fullDescription`: Complete product description
- `imageAttachments`: Array of product images (uploaded to S3)
- `availableSizes`: Array of available sizes
- `availableColors`: Array of available colors
- `variants`: Array of product variants with stock information


## Envs

This project does not require any environment variables.


## `Intuned.jsonc` Reference
```jsonc
{
  // API access settings
  "apiAccess": {
    // Whether to enable consumption through Intuned API
    "enabled": false
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

  // Metadata configuration
  "metadata": {
    // Template information
    "template": {
      "name": "E-Commerce Product Scraper",
      "description": "E-commerce scraping automation that extracts product information from an online store with pagination support"
    },

    // Default job configuration
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
          "apiName": "list",
          "parameters": {}
        }
      ]
    }
  }
}
```

## Using `@intuned/browser` SDK

This project uses the Intuned browser SDK for enhanced reliability:

- **`goToUrl`**: Navigate to URLs with automatic retries and intelligent timeout detection
- **`saveFileToS3`**: Automatically upload images and files to S3 storage
- **`extendPayload`**: Trigger additional API calls dynamically (used to trigger `details` API for each product)

For more information, check out the [Intuned Browser SDK documentation](https://docs.intunedhq.com/automation-sdks/intuned-sdk/overview).
