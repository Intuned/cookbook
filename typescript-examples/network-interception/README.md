# Network Interception Examples

Network interception examples demonstrating two common patterns:

1. **CSRF Token Capture** (`network-interceptor.ts`) - Log in to a website, intercept requests to capture CSRF tokens, and make authenticated API calls
2. **Paginated API Data** (`api-interceptor.ts`) - Intercept API responses while paginating through pages to capture all data

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

Run the API interceptor example:
```bash
# Using default parameters from .parameters/api-interceptor/default.json
yarn intuned run api api-interceptor

# With custom parameters
yarn intuned run api api-interceptor --parameters '{"url": "https://sandbox.intuned.dev/consultations/list", "api_pattern": "/rest/v1/consultations", "max_pages": 5}'
```

Run the network interceptor example:
```bash
# Using default parameters from .parameters/network-interceptor/default.json
yarn intuned run api network-interceptor

# With custom parameters
yarn intuned run api network-interceptor --parameters '{"url": "https://demo.openimis.org/front/insuree/insurees", "api_url": "https://demo.openimis.org/api/graphql", "query": "{ insurees(first: 10) { edges { node { chfId lastName otherNames dob } } } }", "username": "Admin", "password": "admin123"}'
```

### Deploy project
```bash
# npm
npm run intuned deploy

# yarn
yarn intuned deploy
```

## Envs

This project uses the following environment variables:

- `INTUNED_API_KEY` - Your Intuned API key (required for deployment)

Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

## Project Structure
The project structure is as follows:
```
├── api/                              # Your API endpoints
│   ├── network-interceptor.ts        # CSRF token capture and authenticated API calls
│   └── api-interceptor.ts            # Paginated API response interception
├── utils/
│   └── typesAndSchemas.ts            # Shared types and Zod schemas
├── .parameters/                      # Parameter files for local testing
│   ├── network-interceptor/
│   │   └── default.json              # Default parameters for CSRF interceptor
│   └── api-interceptor/
│       └── default.json              # Default parameters for API interceptor
├── package.json                      # TypeScript project dependencies
└── Intuned.jsonc                     # Intuned project configuration file
```

## How It Works

### network-interceptor.ts (CSRF Token Capture)

This example demonstrates how to:
1. Log in to the OpenIMIS demo site using provided credentials
2. Set up a request interceptor to capture CSRF tokens from outgoing requests
3. Navigate to the target URL and wait for network activity
4. Capture the CSRF token from request headers (`x-csrftoken`)
5. Make authenticated GraphQL API calls using the captured token

**Example parameters:**
```json
{
  "url": "https://demo.openimis.org/front/insuree/insurees",
  "api_url": "https://demo.openimis.org/api/graphql",
  "query": "{ insurees(first: 10) { edges { node { chfId lastName otherNames dob } } } }",
  "username": "Admin",
  "password": "admin123"
}
```

**Customization points:**
- Login selectors: Update the `login()` function with your site's selectors
- CSRF header name: Change `x-csrftoken` to match your API (common: `x-csrf-token`, `x-xsrf-token`)
- Request URL pattern: Modify the pattern in `interceptRequest()` to match your API endpoints
- API headers: Customize headers in `fetchWithCsrf()` to match your API requirements

### api-interceptor.ts (Paginated API Data)

This example demonstrates how to:
1. Set up a response listener for a specified API pattern
2. Navigate to the URL and capture initial data from matching API responses
3. Click through pagination to load more pages
4. Aggregate all captured data and return it

**Example parameters:**
```json
{
  "url": "https://sandbox.intuned.dev/consultations/list",
  "api_pattern": "/rest/v1/consultations",
  "max_pages": 3
}
```

**Customization points:**
- API pattern: Change `api_pattern` to match the API endpoints you want to capture
- Pagination selector: Update `#next-page-btn` to match your site's next button selector
- Data structure: Modify the response handler to handle different API response formats
- Max pages: Adjust `max_pages` to control how many pages to scrape

## Use Cases

These patterns are useful when you need to:
- Interact with APIs that require CSRF protection
- Extract data that is loaded via API calls rather than rendered in HTML
- Bypass rate limits by using the browser's authenticated session
- Collect paginated data without parsing HTML
- Make authenticated API calls without managing cookies manually

## `@intuned/browser`: Intuned Browser SDK

This project uses Intuned browser SDK. For more information, check out the [Intuned Browser SDK documentation](https://docs.intunedhq.com/automation-sdks/overview).

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
  }

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
  }

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
  "region": "us"
}
```
