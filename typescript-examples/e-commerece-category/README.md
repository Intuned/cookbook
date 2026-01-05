# e-commerce-category Intuned project

E-commerce store scraper template for sites with category-based navigation. Scrapes categories, product listings, and detailed product information.

## Key Features

- **Category-Based Navigation**: Automatically discovers and scrapes all product categories from store menus
- **Three-Step Workflow**: Categories → Product Lists → Product Details using `extendPayload` chaining
- **Dynamic API Chaining**: Each API automatically triggers the next step in the scraping workflow
- **Comprehensive Product Data**: Extracts titles, prices, sizes, descriptions, shipping, and returns information

<!-- IDE-IGNORE-START -->
## Run on Intuned

[![Run on Intuned](https://cdn1.intuned.io/button.svg)](https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/e-commerece-category)

## Getting Started

To get started developing browser automation projects with Intuned, check out our [Quick Starts Guide](https://docs.intunedhq.com/docs/00-getting-started/quickstarts).


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
npm run intuned run api category .parameters/api/category/default.json
npm run intuned run api list .parameters/api/list/default.json
npm run intuned run api details .parameters/api/details/default.json

# yarn
yarn intuned run api category .parameters/api/category/default.json
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
├── Intuned.jsonc                    # Intuned project configuration
└── package.json                     # Node.js project dependencies
```


## APIs

| API | Description |
|-----|-------------|
| `category` | Entry point that scrapes all category links from the store's main navigation menu. Automatically triggers `list` for each category using `extendPayload` |
| `list` | Scrapes product listings from a specific category page. Automatically triggers `details` for each product using `extendPayload` |
| `details` | Extracts comprehensive product information including title, price, available sizes, description, shipping details, and returns policy |


## Learn More

- [Intuned Documentation](https://docs.intunedhq.com)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [Web Scraping Recipe](https://docs.intunedhq.com/docs/01-learn/recipes/)
- [extendPayload Helper](https://docs.intunedhq.com/docs/05-references/runtime-sdk-typescript/extend-payload)
