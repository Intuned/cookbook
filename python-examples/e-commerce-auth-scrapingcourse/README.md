# E-Commerce Auth Product Scraper

Authenticated e-commerce scraping automation that extracts product information from a protected dashboard using Auth Sessions.

## Getting Started

To get started developing browser automation projects with Intuned, check out our [concepts and terminology](https://docs.intunedhq.com/docs/getting-started/conceptual-guides/core-concepts#runs%3A-executing-your-automations).


## Development

> **_NOTE:_**  All commands support `--help` flag to get more information about the command and its arguments and options.

### Install dependencies
```bash
# Using uv (recommended)
uv sync

# Using pip
pip install -e .
```


### Run an API

```bash
# Using uv
uv run intuned run api <api-name> <parameters>

# Using pip
intuned run api <api-name> <parameters>
```

#### Example: List Products

```bash
# List products from authenticated dashboard
uv run intuned run api list .parameters/api/list/default.json
```

#### Example: Get Product Details

```bash
# Get details for a specific product
uv run intuned run api details .parameters/api/details/default.json
```

### Deploy project
```bash
# Using uv
uv run intuned deploy

# Using pip
intuned deploy
```


## Auth Sessions

This project uses Intuned Auth Sessions to maintain authenticated access to the dashboard. To learn more, check out the [Authenticated Browser Automations: Conceptual Guide](https://docs.intunedhq.com/docs/getting-started/conceptual-guides/authenticated-browser-automations-conceptual-guide).

### Create a new auth session
```bash
# Using uv
uv run intuned run authsession create .parameters/auth-sessions/create/default.json

# Using pip
intuned run authsession create .parameters/auth-sessions/create/default.json
```

### Update an existing auth session
```bash
# Using uv
uv run intuned run authsession update <auth-session-id>

# Using pip
intuned run authsession update <auth-session-id>
```

### Validate an auth session
```bash
# Using uv
uv run intuned run authsession validate <auth-session-id>

# Using pip
intuned run authsession validate <auth-session-id>
```


## Project Structure
The project structure is as follows:
```
/
├── api/                      # Your API endpoints
│   ├── list.py              # API to scrape product list from dashboard
│   └── details.py           # API to scrape detailed product information
├── auth-sessions/            # Auth session related APIs
│   ├── check.py             # API to check if the auth session is still valid
│   └── create.py            # API to create/recreate the auth session programmatically
├── utils/                    # Utility files
│   └── types_and_schemas.py # Python types and Pydantic models
└── Intuned.jsonc              # Intuned project configuration file
```


## APIs

### `list` - Product List Scraper

Scrapes products from the authenticated dashboard.

**Parameters:**
None

**Returns:**
List of products with:
- `name`: Product name
- `detailsUrl`: URL to product details page

**Features:**
- Requires authenticated session
- Automatically navigates to dashboard
- Triggers `details` API for each product using `extend_payload`

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
- `imageAttachments`: List of product images (uploaded to S3)
- `availableSizes`: List of available sizes
- `availableColors`: List of available colors
- `variants`: List of product variants with stock information


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
    // "API" type requires implementing auth-sessions/create.py
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

## Using `intuned_browser` SDK

This project uses the Intuned browser SDK for enhanced reliability:

- **`go_to_url`**: Navigate to URLs with automatic retries and intelligent timeout detection
- **`save_file_to_s3`**: Automatically upload images and files to S3 storage
- **`extend_payload`**: Trigger additional API calls dynamically (used to trigger `details` API for each product)

For more information, check out the [Intuned Browser SDK documentation](https://docs.intunedhq.com/automation-sdks/intuned-sdk/overview).
