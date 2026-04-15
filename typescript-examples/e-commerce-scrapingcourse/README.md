# E-Commerce Scrapingcourse (TypeScript)

Basic e-commerce scraper using scrapingcourse.com.

<!-- IDE-IGNORE-START -->
## Run on Intuned

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/e-commerce-scrapingcourse" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>
<!-- IDE-IGNORE-END -->

## APIs

| API | Description |
| --- | ----------- |
| `list` | Scrapes products from the e-commerce store with pagination support. Automatically triggers `details` API for each product using `extendPayload` |
| `details` | Extracts detailed information for a specific product including price, SKU, category, descriptions, images (uploaded to S3), sizes, colors, and variants |

<!-- IDE-IGNORE-START -->
## Getting started

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

### Prepare the project

Before running any API, provision and deploy the project first.

```bash
intuned dev provision
intuned dev deploy
```

### Run an API

```bash
intuned dev run api list .parameters/api/list/default.json
intuned dev run api details .parameters/api/details/default.json
```
<!-- IDE-IGNORE-END -->

## Project structure

```text
/
├── api/
│   ├── list.ts              # Scrape product list with pagination
│   └── details.ts           # Extract detailed product information
├── utils/
│   └── typesAndSchemas.ts   # Type definitions and Zod schemas
├── intuned-resources/
│   └── jobs/
│       ├── list.job.jsonc    # Job for product list
│       └── details.job.jsonc # Job for product details
├── .parameters/api/         # Test parameters
├── Intuned.jsonc            # Project config
├── package.json             # Node.js dependencies
└── README.md
```

## Key features

- **Automatic pagination**: The `list` API automatically handles pagination to scrape multiple pages
- **Dynamic API chaining**: Uses `extendPayload` to automatically trigger the `details` API for each product found
- **S3 file upload**: Product images are automatically uploaded to S3 using `saveFileToS3`
- **Job configuration**: Configured as a job template with retry logic and concurrent request handling

## Related

- [Intuned CLI](https://intunedhq.com/docs/main/05-references/cli/overview)
- [Intuned Browser SDK](https://intunedhq.com/docs/automation-sdks/overview)
- [Web Scraping Recipe](https://intunedhq.com/docs/main/01-learn/recipes/)
- [extendPayload Helper](https://intunedhq.com/docs/main/05-references/runtime-sdk-typescript/extend-payload)
- [saveFileToS3 Helper](https://intunedhq.com/docs/automation-sdks/intuned-sdk/typescript/helpers/functions/saveFileToS3)
- [Intuned llm.txt](https://intunedhq.com/docs/llms.txt)
