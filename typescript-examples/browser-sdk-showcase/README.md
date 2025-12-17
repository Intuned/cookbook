# Browser SDK Showcase

A comprehensive collection of browser automation helper functions from the Intuned Browser SDK. This project demonstrates various utilities for web scraping, data processing, file handling, and AI-powered operations.

## Getting Started

To get started developing browser automation projects with Intuned, check out our [concepts and terminology](https://docs.intunedhq.com/docs/getting-started/conceptual-guides/core-concepts#runs%3A-executing-your-automations).


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

You can run APIs with custom parameters or use the default parameters from the `.parameters` folder:

```bash
# Run with default parameters
yarn intuned run api go-to-url --parameters-file .parameters/go-to-url/default.json

# Run with custom parameters
yarn intuned run api go-to-url --parameters '{"url": "https://example.com", "waitUntil": "load", "timeout": 30000}'

# Other examples with default parameters
yarn intuned run api download-file --parameters-file .parameters/download-file/default.json
yarn intuned run api scroll-to-load-content --parameters-file .parameters/scroll-to-load-content/default.json
yarn intuned run api wait-for-dom-settled --parameters-file .parameters/wait-for-dom-settled/default.json
yarn intuned run api wait-for-network-settled --parameters-file .parameters/wait-for-network-settled/default.json

# AI-powered helpers (requires API keys)
yarn intuned run api ai/extract-structured-data --parameters-file .parameters/extract-structured-data/default.json

# S3 file operations (requires S3 credentials in .env)
yarn intuned run api upload-file-to-s3 --parameters-file .parameters/upload-file-to-s3/default.json
yarn intuned run api save-file-to-s3 --parameters-file .parameters/save-file-to-s3/default.json
```

### Deploy project
```bash
# npm
npm run intuned deploy

# yarn
yarn intuned deploy
```




### `@intuned/browser`: Intuned Browser SDK

This project uses Intuned browser SDK. For more information, check out the [Intuned Browser SDK documentation](https://docs.intunedhq.com/automation-sdks/intuned-sdk/overview).




## Project Structure
The project structure is as follows:
```
/
├── .parameters/                  # Default parameters for API testing
│   ├── download-file/
│   │   └── default.json
│   ├── extract-structured-data/
│   │   └── default.json
│   ├── go-to-url/
│   │   └── default.json
│   ├── save-file-to-s3/
│   │   └── default.json
│   ├── scroll-to-load-content/
│   │   └── default.json
│   ├── upload-file-to-s3/
│   │   └── default.json
│   ├── wait-for-dom-settled/
│   │   └── default.json
│   └── wait-for-network-settled/
│       └── default.json
├── api/                          # Browser SDK helper examples
│   ├── ai/                       # AI-powered helpers (requires API keys & credits)
│   │   ├── extract-structured-data.ts  # Extract structured data from content
│   │   └── is-page-loaded.ts           # Check if page is fully loaded
│   ├── click-until-exhausted.ts        # Click button until no more content
│   ├── download-file.ts                # Download files from URL or triggers
│   ├── extract-markdown.ts             # Convert HTML to markdown
│   ├── filter-empty-values.ts          # Remove empty values from data
│   ├── go-to-url.ts                    # Navigate to URLs with options
│   ├── process-date.ts                 # Parse various date formats
│   ├── resolve-url.ts                  # Resolve relative URLs
│   ├── sanitize-html.ts                # Clean and sanitize HTML
│   ├── save-file-to-s3.ts              # Save files to S3
│   ├── scroll-to-load-content.ts       # Scroll to load dynamic content
│   ├── upload-file-to-s3.ts            # Upload files to S3
│   ├── validate-data-using-schema.ts   # Validate data with JSON schemas
│   ├── wait-for-dom-settled.ts         # Wait for DOM to stabilize
│   └── wait-for-network-settled.ts     # Wait for network requests to settle
├── .env.example                        # Example environment variables
└── Intuned.jsonc                       # Intuned project configuration file
```

## SDK Helpers Showcase

### Navigation & Page Management
- **go-to-url**: Navigate to URLs with advanced options
- **wait-for-dom-settled**: Wait for DOM mutations to stabilize
- **wait-for-network-settled**: Wait for all network requests to complete

### Content Loading & Interaction
- **click-until-exhausted**: Click "Load More" buttons until all content is loaded
- **scroll-to-load-content**: Scroll to trigger lazy-loaded content

### Data Extraction & Processing
- **extract-markdown**: Convert HTML content to clean markdown
- **sanitize-html**: Clean and sanitize HTML content
- **filter-empty-values**: Remove null/empty values from objects
- **validate-data-using-schema**: Validate data against JSON schemas

### File Operations
- **download-file**: Download files from URLs or user interactions
- **upload-file-to-s3**: Upload files to S3 buckets
- **save-file-to-s3**: Save content directly to S3

### Utilities
- **process-date**: Parse various date formats into standardized format
- **resolve-url**: Resolve relative URLs to absolute URLs

### AI-Powered Helpers
See [ai/README.md](./api/ai/README.md) for AI helpers that require API keys and use AI credits.

## Environment Variables

This project uses environment variables for API keys and credentials. Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

### Required Environment Variables

#### Intuned API Key
```bash
INTUNED_API_KEY=your_api_key_here
```
Required for all Intuned operations.

#### AI Provider Keys (for AI-powered helpers)
```bash
ANTHROPIC_API_KEY=your_anthropic_api_key
OPENAI_API_KEY=your_openai_api_key
GOOGLE_API_KEY=your_gemini_api_key
```
Required when using AI-powered helpers like `extract-structured-data` and `is-page-loaded`.

#### AWS S3 Credentials (for S3 file operations)
```bash
INTUNED_S3_SECRET_ACCESS_KEY=your_s3_secret_access_key
INTUNED_S3_ACCESS_KEY_ID=your_s3_access_key
INTUNED_S3_REGION=region
INTUNED_S3_BUCKET=bucket_name
```
Required when using S3 file operations like `upload-file-to-s3` and `save-file-to-s3`.

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

  // API access settings
  "apiAccess": {
    // Whether to enable consumption through Intuned API. If this is false, the project can only be consumed through jobs.
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

## Documentation

For detailed documentation on each helper function, visit:
- [Intuned Browser SDK - TypeScript](https://docs.intunedhq.com/automation-sdks/intuned-sdk/typescript/helpers/functions/)
- [Browser SDK Overview](https://docs.intunedhq.com/automation-sdks/intuned-sdk/overview)
