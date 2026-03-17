# JSDOM (TypeScript)

Web scraping example using JSDOM for HTML parsing.

<!-- IDE-IGNORE-START -->
## Run on Intuned

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/jsdom" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>
<!-- IDE-IGNORE-END -->

## APIs

| API | Description |
| --- | ----------- |
| `list` | Scrapes product listings with pagination using JSDOM. Extracts product title, price, and URL, then calls `extendPayload` to trigger `details` for each product |
| `details` | Extracts detailed product information (description, SKU, category, sizes, colors, images) from individual product pages using JSDOM |

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

### Run an API

```bash
intuned dev run api list .parameters/api/list/default.json
intuned dev run api details .parameters/api/details/default.json
```

### Save project

```bash
intuned dev provision
```

### Deploy

```bash
intuned dev deploy
```
<!-- IDE-IGNORE-END -->

## Project structure

```text
/
├── api/
│   ├── list.ts               # Scrape product listings with pagination
│   └── details.ts            # Extract detailed product information
├── utils/
│   └── typesAndSchemas.ts    # Zod schemas and TypeScript interfaces
├── intuned-resources/
│   └── jobs/
│       ├── list.job.jsonc    # Job for product list
│       └── details.job.jsonc # Job for product details
├── .parameters/api/          # Test parameters
├── Intuned.jsonc             # Project config
├── package.json              # Node.js dependencies
└── README.md
```

## Related

- [Intuned CLI](https://docs.intunedhq.com/docs/05-references/cli/overview)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
