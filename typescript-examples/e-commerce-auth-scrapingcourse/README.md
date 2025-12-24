# E-Commerce Auth Product Scraper

Authenticated e-commerce scraping automation that extracts product information from a protected dashboard using Auth Sessions.

## Run on Intuned

Open this project in Intuned by clicking the button below.

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/e-commerce-auth-scrapingcourse" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>

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
npm run intuned run api list .parameters/api/list/default.json
npm run intuned run api details .parameters/api/details/default.json

# yarn
yarn intuned run api list .parameters/api/list/default.json
yarn intuned run api details .parameters/api/details/default.json
```

#### Example: List Products

```bash
# List products from authenticated dashboard
# npm
npm run intuned run api list .parameters/api/list/default.json

# yarn
yarn intuned run api list .parameters/api/list/default.json
```

#### Example: Get Product Details

```bash
# Get details for a specific product
# npm
npm run intuned run api details .parameters/api/details/default.json

# yarn
yarn intuned run api details .parameters/api/details/default.json
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
npm run intuned run authsession create .parameters/auth-sessions/create/default.json

# yarn
yarn intuned run authsession create .parameters/auth-sessions/create/default.json
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
├── api/                      # Your API endpoints
│   ├── list.ts              # API to scrape product list from dashboard
│   └── details.ts           # API to scrape detailed product information
├── auth-sessions/            # Auth session related APIs
│   ├── check.ts             # API to check if the auth session is still valid
│   └── create.ts            # API to create/recreate the auth session programmatically
├── utils/                    # Utility files
│   └── typeAndSchemas.ts    # TypeScript types and Zod schemas
└── Intuned.jsonc              # Intuned project configuration file
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
  },

  // Default job configuration
  "metadata": {
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
    // Test credentials for auth session creation
    "testAuthSessionInput": {
      "username": "admin@example.com",
      "password": "password"
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
