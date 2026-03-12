# e-commerce-nested Intuned project

E-commerce store scraper template for sites with category-based navigation. Scrapes categories, product listings, and detailed product information.

## Key Features

- **Category-Based Navigation**: Automatically discovers and scrapes all product categories from store menus
- **Three-Step Workflow**: Categories → Product Lists → Product Details using `extendPayload` chaining
- **Dynamic API Chaining**: Each API automatically triggers the next step in the scraping workflow
- **Comprehensive Product Data**: Extracts titles, prices, sizes, descriptions, shipping, and returns information

<!-- IDE-IGNORE-START -->

## Run on Intuned

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/e-commerce-nested" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>

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
intuned dev run api category .parameters/api/category/default.json
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
├── .parameters/                      # Test parameters for APIs
│   └── api/
│       ├── category/
│       │   └── default.json
│       ├── list/
│       │   └── default.json
│       └── details/
│           └── default.json
├── api/                              # API endpoints
│   ├── category.ts       # Scrape category links from menu
│   ├── list.ts           # List products from category page
│   └── details.ts        # Extract detailed product info
├── utils/                            # Utility modules
│   └── typesAndSchemas.ts           # Type definitions and Zod schemas
├── intuned-resources/
│   └── jobs/
│       ├── category.job.jsonc       # Job for category scraping
│       ├── list.job.jsonc           # Job for product list
│       └── details.job.jsonc        # Job for product details
├── Intuned.jsonc                    # Intuned project configuration
└── package.json                     # Node.js project dependencies
```

## APIs

| API        | Description                                                                                                                                              |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `category` | Entry point that scrapes all category links from the store's main navigation menu. Automatically triggers `list` for each category using `extendPayload` |
| `list`     | Scrapes product listings from a specific category page. Automatically triggers `details` for each product using `extendPayload`                          |
| `details`  | Extracts comprehensive product information including title, price, available sizes, description, shipping details, and returns policy                    |

## Learn More

- [Intuned Documentation](https://docs.intunedhq.com)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [Web Scraping Recipe](https://docs.intunedhq.com/docs/01-learn/recipes/)
- [extendPayload Helper](https://docs.intunedhq.com/docs/05-references/runtime-sdk-typescript/extend-payload)
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
