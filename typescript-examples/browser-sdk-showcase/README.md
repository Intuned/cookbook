# Browser SDK Showcase

A comprehensive collection of browser automation helper functions from the Intuned Browser SDK. This project demonstrates various utilities for web scraping, data processing, file handling, and AI-powered operations.

<!-- IDE-IGNORE-START -->
## Run on Intuned

Open this project in Intuned by clicking the button below.

[![Run on Intuned](https://cdn1.intuned.io/button.svg)](https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/browser-sdk-showcase)

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

After installing dependencies, `intuned` command should be available in your environment.

### Run an API

```bash
# npm
npm run intuned run api click-until-exhausted .parameters/api/click-until-exhausted/default.json
npm run intuned run api download-file .parameters/api/download-file/default.json
npm run intuned run api extract-markdown .parameters/api/extract-markdown/default.json
npm run intuned run api filter-empty-values .parameters/api/filter-empty-values/default.json
npm run intuned run api go-to-url .parameters/api/go-to-url/default.json
npm run intuned run api process-date .parameters/api/process-date/default.json
npm run intuned run api resolve-url .parameters/api/resolve-url/default.json
npm run intuned run api sanitize-html .parameters/api/sanitize-html/default.json
npm run intuned run api save-file-to-s3 .parameters/api/save-file-to-s3/default.json
npm run intuned run api scroll-to-load-content .parameters/api/scroll-to-load-content/default.json
npm run intuned run api upload-file-to-s3 .parameters/api/upload-file-to-s3/default.json
npm run intuned run api validate-data-using-schema .parameters/api/validate-data-using-schema/default.json
npm run intuned run api wait-for-dom-settled .parameters/api/wait-for-dom-settled/default.json
npm run intuned run api wait-for-network-settled .parameters/api/wait-for-network-settled/default.json
npm run intuned run api ai/extract-structured-data .parameters/api/ai/extract-structured-data/default.json
npm run intuned run api ai/is-page-loaded .parameters/api/ai/is-page-loaded/default.json

# yarn
yarn intuned run api click-until-exhausted .parameters/api/click-until-exhausted/default.json
yarn intuned run api download-file .parameters/api/download-file/default.json
yarn intuned run api extract-markdown .parameters/api/extract-markdown/default.json
yarn intuned run api filter-empty-values .parameters/api/filter-empty-values/default.json
yarn intuned run api go-to-url .parameters/api/go-to-url/default.json
yarn intuned run api process-date .parameters/api/process-date/default.json
yarn intuned run api resolve-url .parameters/api/resolve-url/default.json
yarn intuned run api sanitize-html .parameters/api/sanitize-html/default.json
yarn intuned run api save-file-to-s3 .parameters/api/save-file-to-s3/default.json
yarn intuned run api scroll-to-load-content .parameters/api/scroll-to-load-content/default.json
yarn intuned run api upload-file-to-s3 .parameters/api/upload-file-to-s3/default.json
yarn intuned run api validate-data-using-schema .parameters/api/validate-data-using-schema/default.json
yarn intuned run api wait-for-dom-settled .parameters/api/wait-for-dom-settled/default.json
yarn intuned run api wait-for-network-settled .parameters/api/wait-for-network-settled/default.json
yarn intuned run api ai/extract-structured-data .parameters/api/ai/extract-structured-data/default.json
yarn intuned run api ai/is-page-loaded .parameters/api/ai/is-page-loaded/default.json
```

### Deploy project
```bash
# npm
npm run intuned deploy

# yarn
yarn intuned deploy
```
<!-- IDE-IGNORE-END -->

### Intuned Browser SDK

This project uses the Intuned Browser SDK to demonstrate various helper functions for browser automation. For more information, check out the [Intuned Browser SDK documentation](https://docs.intunedhq.com/automation-sdks/overview).




## Project Structure

```
/
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
│   ├── validate-data-using-schema.ts   # Validate data with JSON/Zod schemas
│   ├── wait-for-dom-settled.ts         # Wait for DOM to stabilize
│   └── wait-for-network-settled.ts     # Wait for network requests to settle
├── .parameters/                  # Test parameters for APIs
│   └── api/                      # API parameters folder
│       ├── ai/                   # AI helpers parameters
│       │   ├── extract-structured-data/
│       │   │   └── default.json
│       │   └── is-page-loaded/
│       │       └── default.json
│       ├── click-until-exhausted/
│       │   └── default.json
│       ├── download-file/
│       │   └── default.json
│       ├── extract-markdown/
│       │   └── default.json
│       ├── filter-empty-values/
│       │   └── default.json
│       ├── go-to-url/
│       │   └── default.json
│       ├── process-date/
│       │   └── default.json
│       ├── resolve-url/
│       │   └── default.json
│       ├── sanitize-html/
│       │   └── default.json
│       ├── save-file-to-s3/
│       │   └── default.json
│       ├── scroll-to-load-content/
│       │   └── default.json
│       ├── upload-file-to-s3/
│       │   └── default.json
│       ├── validate-data-using-schema/
│       │   └── default.json
│       ├── wait-for-dom-settled/
│       │   └── default.json
│       └── wait-for-network-settled/
│           └── default.json
├── Intuned.jsonc                 # Intuned project configuration file
├── package.json                  # Node.js project dependencies
└── tsconfig.json                 # TypeScript configuration
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
- **validate-data-using-schema**: Validate data against JSON/Zod schemas

### File Operations
- **download-file**: Download files from URLs or user interactions
- **upload-file-to-s3**: Upload files to S3 buckets
- **save-file-to-s3**: Save content directly to S3

### Utilities
- **process-date**: Parse various date formats into standardized format
- **resolve-url**: Resolve relative URLs to absolute URLs

### AI-Powered Helpers
See [ai/README.md](./api/ai/README.md) for AI helpers that require API keys and use AI credits.


## Learn More

For detailed documentation on each helper function, visit:
- [Intuned Browser SDK - TypeScript](https://docs.intunedhq.com/automation-sdks/intuned-sdk/typescript/helpers/functions/)
- [Browser SDK Overview](https://docs.intunedhq.com/automation-sdks/overview)
