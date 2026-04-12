# E-Commerce Nested (TypeScript)

E-commerce category and product scraper.

<!-- IDE-IGNORE-START -->
## Run on Intuned

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/e-commerce-nested" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>
<!-- IDE-IGNORE-END -->

## APIs

| API | Description |
| --- | ----------- |
| `category` | Entry point that scrapes all category links from the store's main navigation menu. Automatically triggers `list` for each category using `extendPayload` |
| `list` | Scrapes product listings from a specific category page. Automatically triggers `details` for each product using `extendPayload` |
| `details` | Extracts comprehensive product information including title, price, available sizes, description, shipping details, and returns policy |

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
intuned dev run api category .parameters/api/category/default.json
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
│   ├── category.ts                  # Scrape category links from menu
│   ├── list.ts                      # List products from category page
│   └── details.ts                   # Extract detailed product info
├── utils/
│   └── typesAndSchemas.ts           # Type definitions and Zod schemas
├── intuned-resources/
│   └── jobs/
│       └── category.job.jsonc       # Top-level job example for the category -> list -> details flow
├── .parameters/api/                 # Test parameters
├── Intuned.jsonc                    # Project config
├── package.json                     # Node.js dependencies
└── README.md
```

## Key features

- **Category-based navigation**: Automatically discovers and scrapes all product categories from store menus
- **Three-step workflow**: Categories → Product Lists → Product Details using `extendPayload` chaining
- **Dynamic API chaining**: Each API automatically triggers the next step in the scraping workflow
- **Comprehensive product data**: Extracts titles, prices, sizes, descriptions, shipping, and returns information

## Related

- [Intuned CLI](https://intunedhq.com/docs/main/05-references/cli/overview)
- [Intuned Browser SDK](https://intunedhq.com/docs/automation-sdks/overview)
- [Web Scraping Recipe](https://intunedhq.com/docs/main/01-learn/recipes/)
- [extendPayload Helper](https://intunedhq.com/docs/main/05-references/runtime-sdk-typescript/extend-payload)
- [Intuned llm.txt](https://intunedhq.com/docs/llms.txt)
