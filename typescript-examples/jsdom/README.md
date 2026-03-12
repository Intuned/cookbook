# jsdom Intuned project

E-commerce scraper using JSDOM for HTML parsing to extract product listings and details with pagination support.

<!-- IDE-IGNORE-START -->
## Run on Intuned

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/jsdom" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>

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
# List products with pagination
intuned dev run api list .parameters/api/list/default.json

# Get product details
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
├── api/                      # Your API endpoints
│   ├── list.ts               # API to scrape product listings with pagination
│   └── details.ts            # API to extract detailed product information
├── utils/
│   └── typesAndSchemas.ts    # Zod schemas and TypeScript interfaces
├── intuned-resources/
│   └── jobs/
│       ├── list.job.jsonc    # Job for product list
│       └── details.job.jsonc # Job for product details
├── .parameters/api/          # Parameter files for testing
├── package.json              # Typescript project dependencies
└── Intuned.jsonc             # Intuned project configuration file
```

### How It Works

1. **list.ts** - Navigates to the listing page, extracts product title, price, and URL using JSDOM, follows pagination links, and calls `extendPayload` to send each product to the details API.

2. **details.ts** - Receives product data from list API, navigates to the product page, and extracts additional details (description, SKU, category, sizes, colors, images).

## Related

- [Intuned CLI](https://docs.intunedhq.com/docs/05-references/cli/overview)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
