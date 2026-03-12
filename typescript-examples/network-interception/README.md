# network-interception Intuned project

Network interception examples demonstrating two common patterns:

1. **CSRF Token Capture** (`network-interceptor.ts`) - Log in to a website, intercept requests to capture CSRF tokens, and make authenticated API calls
2. **Paginated API Data** (`api-interceptor.ts`) - Intercept API responses while paginating through pages to capture all data

<!-- IDE-IGNORE-START -->
## Run on Intuned

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/network-interception" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>

## Getting Started

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
# CSRF Token Capture
intuned dev run api network-interceptor .parameters/api/network-interceptor/default.json

# Paginated API Data
intuned dev run api api-interceptor .parameters/api/api-interceptor/default.json
```

### Save project

```bash
intuned dev provision
```

### Deploy project

```bash
intuned dev deploy
```
<!-- IDE-IGNORE-END -->

## Project Structure

```text
/
├── api/                              # Your API endpoints
│   ├── network-interceptor.ts        # CSRF token capture and authenticated API calls
│   └── api-interceptor.ts            # Paginated API response interception
├── utils/
│   └── typesAndSchemas.ts            # Shared types and Zod schemas
├── intuned-resources/
│   └── jobs/
│       ├── network-interceptor.job.jsonc  # Job for CSRF interceptor
│       └── api-interceptor.job.jsonc      # Job for paginated API interceptor
├── .parameters/api/                  # Parameter files for testing
├── package.json                      # TypeScript project dependencies
└── Intuned.jsonc                     # Intuned project configuration file
```

## How It Works

### network-interceptor.ts (CSRF Token Capture)

1. Logs in to the target website using provided credentials
2. Sets up a request interceptor to capture CSRF tokens from outgoing requests
3. Navigates to the target URL and waits for network activity
4. Captures the CSRF token from request headers (e.g., `x-csrftoken`)
5. Makes authenticated API calls using the captured token

### api-interceptor.ts (Paginated API Data)

1. Sets up a response listener for a specified API pattern
2. Navigates to the URL and captures initial data from matching API responses
3. Clicks the "Next" button to load more pages
4. Aggregates all captured data and returns it

These patterns are useful when you need to interact with APIs that require CSRF protection or when data is loaded via API calls rather than rendered in HTML.

## Learn More

- [Intuned CLI](https://docs.intunedhq.com/docs/05-references/cli/overview)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
