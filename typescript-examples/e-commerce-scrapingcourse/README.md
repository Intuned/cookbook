# e-commerce-scrapingcourse Intuned project

E-commerce scraping automation that extracts product information from an online store with pagination support.

## Key Features

- **Automatic Pagination**: The `list` API automatically handles pagination to scrape multiple pages
- **Dynamic API Chaining**: Uses `extendPayload` to automatically trigger the `details` API for each product found
- **S3 File Upload**: Product images are automatically uploaded to S3 using `saveFileToS3`
- **Job Configuration**: Configured as a job template with retry logic and concurrent request handling

<!-- IDE-IGNORE-START -->
## Run on Intuned

Open this project in Intuned by clicking the button below.

[![Run on Intuned](https://cdn1.intuned.io/button.svg)](https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/e-commerce-scrapingcourse)

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

### Save project
```bash
# npm
npm run intuned run save

# yarn
yarn intuned run save
```

Reference for saving project [here](https://docs.intunedhq.com/docs/02-features/local-development-cli#use-runtime-sdk-and-browser-sdk-helpers)

### Deploy project
```bash
# npm
npm run intuned deploy

# yarn
yarn intuned deploy
```

### `@intuned/browser`: Intuned Browser SDK

This project uses Intuned browser SDK. For more information, check out the [Intuned Browser SDK documentation](https://docs.intunedhq.com/automation-sdks/overview).

<!-- IDE-IGNORE-END -->


## Project Structure
```
/
├── .parameters/              # Test parameters for APIs
│   └── api/
│       ├── list/
│       │   └── default.json
│       └── details/
│           └── default.json
├── api/                      # API endpoints
│   ├── list.ts              # Scrape product list with pagination
│   └── details.ts           # Extract detailed product information
├── utils/                    # Utility modules
│   └── typesAndSchemas.ts   # Type definitions and Zod schemas
├── Intuned.jsonc            # Intuned project configuration
└── package.json             # Node.js project dependencies
```


## APIs

| API | Description |
|-----|-------------|
| `list` | Scrapes products from the e-commerce store with pagination support. Automatically triggers `details` API for each product using `extendPayload` |
| `details` | Extracts detailed information for a specific product including price, SKU, category, descriptions, images (uploaded to S3), sizes, colors, and variants |


## Learn More

- [Intuned Documentation](https://docs.intunedhq.com)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [Web Scraping Recipe](https://docs.intunedhq.com/docs/01-learn/recipes/)
- [extendPayload Helper](https://docs.intunedhq.com/docs/05-references/runtime-sdk-typescript/extend-timeout)
- [saveFileToS3 Helper](https://docs.intunedhq.com/automation-sdks/intuned-sdk/typescript/helpers/functions/saveFileToS3)
