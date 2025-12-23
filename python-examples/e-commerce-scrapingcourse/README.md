# E-Commerce Product Scraper

E-commerce scraping automation that extracts product information from an online store with pagination support.

## Run on Intuned

Open this project in Intuned by clicking the button below.

[![Run on Intuned](https://cdn1.intuned.io/button.svg)](https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/e-commerce-scrapingcourse)

## Getting Started

To get started developing browser automation projects with Intuned, check out our [concepts and terminology](https://docs.intunedhq.com/docs/getting-started/conceptual-guides/core-concepts#runs%3A-executing-your-automations).


## Development

> **_NOTE:_**  All commands support `--help` flag to get more information about the command and its arguments and options.

### Install dependencies
```bash
uv sync
```

After installing dependencies, `intuned` command should be available in your environment.


### Run an API

```bash
uv run intuned run api list .parameters/api/list/default.json
uv run intuned run api details .parameters/api/details/default.json
```

#### Example: List Products

```bash
# List products with default page limit
uv run intuned run api list .parameters/api/list/default.json
```

#### Example: Get Product Details

```bash
# Get details for a specific product
uv run intuned run api details .parameters/api/details/default.json
```

### Deploy project
```bash
uv run intuned deploy
```


## Project Structure
The project structure is as follows:
```
/
├── api/                      # Your API endpoints
│   ├── list.py              # API to scrape product list with pagination
│   └── details.py           # API to scrape detailed product information
├── utils/                    # Utility files
│   └── types_and_schemas.py # Python types and Pydantic models
└── Intuned.jsonc              # Intuned project configuration file
```


## APIs

### `list` - Product List Scraper

Scrapes products from the e-commerce store with pagination support.

**Parameters:**
- `limit` (optional): Maximum number of pages to scrape (default: 50)

**Returns:**
List of products with:
- `name`: Product name
- `detailsUrl`: URL to product details page

**Features:**
- Automatic pagination handling
- Triggers `details` API for each product using `extend_payload`
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
