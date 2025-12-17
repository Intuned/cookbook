# E-Commerce Auth Product Scraper

Authenticated e-commerce scraping automation that extracts product information from a protected dashboard using Auth Sessions.

## Features

- Authenticated dashboard access using Auth Sessions
- Product list scraping from protected pages
- Detailed product information extraction including variants and images
- Automatic image uploads to S3 storage
- Dynamic payload extension to trigger detail scraping for each product

## Getting Started

To get started developing browser automation projects with Intuned, check out our [concepts and terminology](https://docs.intunedhq.com/docs/getting-started/conceptual-guides/core-concepts#runs%3A-executing-your-automations).

## Prerequisites

Before running this project, you need:

1. An Intuned account and API key
2. Valid credentials for the e-commerce site (default: admin@example.com / password)

## Envs

Set the following environment variables:

```bash
export INTUNED_API_KEY=your_api_key_here
```

You can find your API key in the [Intuned Dashboard](https://app.intunedhq.com).

## Development

> **_NOTE:_** All commands support `--help` flag to get more information about the command and its arguments and options.

### Install dependencies

```bash
# npm
npm install

# yarn
yarn
```

> **_NOTE:_** If you are using `npm`, make sure to pass `--` when using options with the `intuned` command.

### Run an API

```bash
# npm
npm run intuned run api <api-name> <parameters>

# yarn
yarn intuned run api <api-name> <parameters>
```

#### Example: List Products

```bash
# List products from authenticated dashboard
yarn intuned run api list

# Using parameter file
yarn intuned run api list --parameters-file .parameters/list/default.json
```

#### Example: Get Product Details

```bash
# Get details for a specific product
yarn intuned run api details '{"name": "Abominable Hoodie", "detailsUrl": "https://www.scrapingcourse.com/ecommerce/product/abominable-hoodie"}'

# Using parameter file
yarn intuned run api details --parameters-file .parameters/details/product-example.json
```

### Deploy project

```bash
# npm
npm run intuned deploy

# yarn
yarn intuned deploy
```

## Auth Sessions

This project uses Intuned Auth Sessions to maintain authenticated access to the dashboard. To learn more, check out the [Authenticated Browser Automations: Conceptual Guide](https://docs.intunedhq.com/docs/getting-started/conceptual-guides/authenticated-browser-automations-conceptual-guide).

### Create a new auth session

```bash
# npm
npm run intuned run authsession create <parameters>

# yarn
yarn intuned run authsession create <parameters>

# Example
yarn intuned run authsession create '{"username": "admin@example.com", "password": "password"}'

# Using parameter file
yarn intuned run authsession create --parameters-file .parameters/auth/create.json
```

### Update an existing auth session

```bash
# npm
npm run intuned run authsession update <auth-session-id>

# yarn
yarn intuned run authsession update <auth-session-id>
```

### Validate an auth session

```bash
# npm
npm run intuned run authsession validate <auth-session-id>

# yarn
yarn intuned run authsession validate <auth-session-id>
```

## Project Structure

The project structure is as follows:

```
/
├── .parameters/              # Test parameters for APIs and auth sessions
│   ├── list/                # Parameters for list API
│   │   └── default.json     # Empty params (no input required)
│   ├── details/             # Parameters for details API
│   │   └── product-example.json  # Example product details params
│   └── auth/                # Parameters for auth sessions
│       ├── create.json      # Auth session creation credentials
│       └── check.json       # Empty params for session check
├── api/                     # Your API endpoints
│   ├── list.ts             # API to scrape product list from dashboard
│   └── details.ts          # API to scrape detailed product information
├── auth-sessions/           # Auth session related APIs
│   ├── check.ts            # API to check if the auth session is still valid
│   └── create.ts           # API to create/recreate the auth session programmatically
├── utils/                   # Utility files
│   └── typeAndSchemas.ts   # TypeScript types and Zod schemas
└── Intuned.jsonc           # Intuned project configuration file
```

## APIs

### `list` - Product List Scraper

Scrapes products from the authenticated dashboard.

**Parameters:**
None

**Returns:**
Array of products with:
- `name`: Product name
- `detailsUrl`: URL to product details page

**Features:**
- Requires authenticated session
- Automatically navigates to dashboard
- Triggers `details` API for each product using `extendPayload`

**Example:**

```bash
yarn intuned run api list
```

### `details` - Product Details Scraper

Scrapes detailed information for a specific product.

**Parameters:**
- `name`: Product name
- `detailsUrl`: URL to the product details page

**Returns:**
Product details object with:
- `name`: Product name
- `price`: Product price
- `sku`: Stock Keeping Unit
- `category`: Product category
- `shortDescription`: Brief product description
- `fullDescription`: Complete product description
- `imageAttachments`: Array of product images (uploaded to S3)
- `availableSizes`: Array of available sizes
- `availableColors`: Array of available colors
- `variants`: Array of product variants with stock information

**Example:**

```bash
yarn intuned run api details '{"name": "Abominable Hoodie", "detailsUrl": "https://www.scrapingcourse.com/ecommerce/product/abominable-hoodie"}'
```

## `Intuned.jsonc` Reference

```jsonc
{
  // Project name identifier
  "projectName": "e-commerce-auth-scrapingcourse",

  // Template metadata
  "template": {
    "name": "E-Commerce Auth Product Scraper",
    "description": "Authenticated e-commerce scraping automation that extracts product information from a protected dashboard using Auth Sessions."
  },

  // Test credentials for auth session creation
  "testAuthSessionInput": {
    "username": "admin@example.com",
    "password": "password"
  },

  // Default job input configuration
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
  },

  // API access settings
  "apiAccess": {
    // Whether to enable consumption through Intuned API
    "enabled": true
  },

  // Auth session settings
  "authSessions": {
    // Auth sessions are required to access the protected dashboard
    "enabled": true,
    // "API" type requires implementing auth-sessions/create.ts
    "type": "API"
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
  }
}
```

## Using `@intuned/browser` SDK

This project uses the Intuned browser SDK for enhanced reliability:

- **`goToUrl`**: Navigate to URLs with automatic retries and intelligent timeout detection
- **`saveFileToS3`**: Automatically upload images and files to S3 storage
- **`extendPayload`**: Trigger additional API calls dynamically (used to trigger `details` API for each product)

For more information, check out the [Intuned Browser SDK documentation](https://docs.intunedhq.com/automation-sdks/intuned-sdk/overview).
