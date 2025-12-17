# e-commerce-category Intuned project

E-commerce store scraper template for sites with category-based navigation. Scrapes categories, product listings, and detailed product information.

## Getting Started

To get started developing browser automation projects with Intuned, check out our [concepts and terminology](https://docs.intunedhq.com/docs/getting-started/conceptual-guides/core-concepts#runs%3A-executing-your-automations).

## Envs

This project requires the following environment variables:

- `INTUNED_API_KEY` - Your Intuned API key for authentication

Create a `.env` file in the project root with your credentials:

```bash
INTUNED_API_KEY=your_api_key_here
```

You can obtain your API key from the [Intuned Dashboard](https://app.intunedhq.com/).

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

#### Example: Scrape categories from Veja store

Using inline parameters:
```bash
yarn intuned run api ecommerece-category '{"store_url": "https://www.veja-store.com/en_us/"}'
```

Using parameter file:
```bash
yarn intuned run api ecommerece-category --parameters-file .parameters/ecommerece-category/veja-store-categories.json
```

#### Example: Scrape products from a category

Using inline parameters:
```bash
yarn intuned run api ecommerece-list '{"category_name": "Shoes", "category_url": "https://www.veja-store.com/en_us/shoes"}'
```

Using parameter file:
```bash
yarn intuned run api ecommerece-list --parameters-file .parameters/ecommerece-list/veja-shoes-category.json
```

#### Example: Scrape product details

Using inline parameters:
```bash
yarn intuned run api ecommerece-details '{"name": "V-10 LEATHER", "price": "$175.00", "details_url": "https://www.veja-store.com/en_us/v-10-leather-white-natural-vx0202925.html"}'
```

Using parameter file:
```bash
yarn intuned run api ecommerece-details --parameters-file .parameters/ecommerece-details/veja-v10-leather-product.json
```

### Deploy project

```bash
# npm
npm run intuned deploy

# yarn
yarn intuned deploy
```

### `@intuned/browser`: Intuned Browser SDK

This project uses Intuned browser SDK. For more information, check out the [Intuned Browser SDK documentation](https://docs.intunedhq.com/automation-sdks/overview).

## Project Structure

The project structure is as follows:

```
├── api/                          # Your API endpoints
│   ├── ecommerece-category.ts    # API to scrape category links from the main menu
│   ├── ecommerece-list.ts        # API to list all products from a category page
│   └── ecommerece-details.ts     # API to fetch detailed product information
├── .parameters/                  # Example parameters for testing
│   ├── ecommerece-category/      # Parameters for category API
│   ├── ecommerece-list/          # Parameters for list API
│   └── ecommerece-details/       # Parameters for details API
├── utils/
│   └── typesAndSchemas.ts        # Shared types and Zod schemas
├── package.json                  # Typescript project dependencies
└── Intuned.jsonc                 # Intuned project configuration file
```

## How It Works

This project demonstrates a cascading scraper pattern using Intuned's `extendPayload` feature:

1. **ecommerece-category** - Entry point that scrapes category links from the store's main menu
2. **ecommerece-list** - Scrapes product listings from each category using "Load More" pagination
3. **ecommerece-details** - Fetches detailed product info (title, price, sizes, description, shipping/returns)

Each API uses `extendPayload` to chain to the next step in the scraping flow, creating a complete e-commerce scraping pipeline.

### APIs

#### `ecommerece-category`

Scrapes all category links from an e-commerce store's main menu.

**Parameters:**
- `store_url` (string) - The base URL of the e-commerce store

**Returns:**
- Array of categories with `category_name` and `category_url`

**Example:**
```json
{
  "store_url": "https://www.veja-store.com/en_us/"
}
```

#### `ecommerece-list`

Scrapes all products from a category page using "Load More" pagination.

**Parameters:**
- `category_name` (string) - The name of the category
- `category_url` (string) - The URL of the category page

**Returns:**
- Array of products with `name`, `price`, and `details_url`

**Example:**
```json
{
  "category_name": "Shoes",
  "category_url": "https://www.veja-store.com/en_us/shoes"
}
```

#### `ecommerece-details`

Fetches detailed product information from a product page.

**Parameters:**
- `name` (string) - Product name
- `price` (string) - Product price
- `details_url` (string) - URL of the product details page

**Returns:**
- Detailed product information including sizes, description, shipping info

**Example:**
```json
{
  "name": "V-10 LEATHER",
  "price": "$175.00",
  "details_url": "https://www.veja-store.com/en_us/v-10-leather-white-natural-vx0202925.html"
}
```

## Customization

This template is designed for the Veja store but can be easily adapted to other e-commerce sites:

1. Update the selectors in each API file to match your target store's HTML structure
2. Modify the cookie consent handling in `handleCookies()` functions
3. Adjust the pagination logic in `ecommerece-list.ts` if needed
4. Update the product detail extraction in `ecommerece-details.ts` to match available fields

Look for comments starting with "Replace selector" or "Replace with" throughout the code.

## `Intuned.jsonc` Reference

```jsonc
{
  // Your Intuned workspace ID.
  // Optional - If not provided here, it must be supplied via the `--workspace-id` flag during deployment.
  "workspaceId": "your_workspace_id",

  // The name of your Intuned project.
  // Optional - If not provided here, it must be supplied via the command line when deploying.
  "projectName": "your_project_name",

  // Replication settings
  "replication": {
    // The maximum number of concurrent executions allowed via Intuned API. This does not affect jobs.
    // A number of machines equal to this will be allocated to handle API requests.
    // Not applicable if api access is disabled.
    "maxConcurrentRequests": 1,

    // The machine size to use for this project. This is applicable for both API requests and jobs.
    // "standard": Standard machine size (6 shared vCPUs, 2GB RAM)
    // "large": Large machine size (8 shared vCPUs, 4GB RAM)
    // "xlarge": Extra large machine size (1 performance vCPU, 8GB RAM)
    "size": "standard"
  },

  // Auth session settings
  "authSessions": {
    // Whether auth sessions are enabled for this project.
    // If enabled, "auth-sessions/check.ts" API must be implemented to validate the auth session.
    "enabled": true,

    // Whether to save Playwright traces for auth session runs.
    "saveTraces": false,

    // The type of auth session to use.
    // "API" type requires implementing "auth-sessions/create.ts" API to create/recreate the auth session programmatically.
    // "MANUAL" type uses a recorder to manually create the auth session.
    "type": "API",


    // Recorder start URL for the recorder to navigate to when creating the auth session.
    // Required if "type" is "MANUAL". Not used if "type" is "API".
    "startUrl": "https://example.com/login",

    // Recorder finish URL for the recorder. Once this URL is reached, the recorder stops and saves the auth session.
    // Required if "type" is "MANUAL". Not used if "type" is "API".
    "finishUrl": "https://example.com/dashboard",

    // Recorder browser mode
    // "fullscreen": Launches the browser in fullscreen mode.
    // "kiosk": Launches the browser in kiosk mode (no address bar, no navigation controls).
    // Only applicable for "MANUAL" type.
    "browserMode": "fullscreen"
  },

  // API access settings
  "apiAccess": {
    // Whether to enable consumption through Intuned API. If this is false, the project can only be consumed through jobs.
    // This is required for projects that use auth sessions.
    "enabled": true
  },

  // Whether to run the deployed API in a headful browser. Running in headful can help with some anti-bot detections. However, it requires more resources and may work slower or crash if the machine size is "standard".
  "headful": false,

  // The region where your Intuned project is hosted.
  // For a list of available regions, contact support or refer to the documentation.
  // Optional - Default: "us"
  "region": "us",

  // Metadata for playground and testing
  "metadata": {
    "defaultRunPlaygroundInput": {
      "api": "ecommerece-category",
      "parameters": {
        "store_url": "https://www.veja-store.com/en_us/"
      }
    }
  }
}
```
