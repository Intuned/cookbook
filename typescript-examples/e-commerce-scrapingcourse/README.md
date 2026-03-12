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

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/e-commerce-scrapingcourse" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>

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
intuned dev run api list .parameters/api/list/default.json
intuned dev run api details .parameters/api/details/default.json
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
├── intuned-resources/
│   └── jobs/
│       ├── list.job.jsonc   # Job for product list
│       └── details.job.jsonc # Job for product details
├── Intuned.jsonc            # Intuned project configuration
└── package.json             # Node.js project dependencies
```

## APIs

| API       | Description                                                                                                                                             |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `list`    | Scrapes products from the e-commerce store with pagination support. Automatically triggers `details` API for each product using `extendPayload`         |
| `details` | Extracts detailed information for a specific product including price, SKU, category, descriptions, images (uploaded to S3), sizes, colors, and variants |

## Related

- [Intuned Documentation](https://docs.intunedhq.com)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [Web Scraping Recipe](https://docs.intunedhq.com/docs/01-learn/recipes/)
- [extendPayload Helper](https://docs.intunedhq.com/docs/05-references/runtime-sdk-typescript/extend-timeout)
- [saveFileToS3 Helper](https://docs.intunedhq.com/automation-sdks/intuned-sdk/typescript/helpers/functions/saveFileToS3)
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
