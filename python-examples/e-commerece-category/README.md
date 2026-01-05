# e-commerce-category Intuned project

E-commerce store scraper template for sites with category-based navigation. Scrapes categories, product listings, and detailed product information.

## Key Features

- **Category-Based Navigation**: Automatically discovers and scrapes all product categories from store menus
- **Three-Step Workflow**: Categories → Product Lists → Product Details using `extend_payload` chaining
- **Dynamic API Chaining**: Each API automatically triggers the next step in the scraping workflow
- **Comprehensive Product Data**: Extracts titles, prices, sizes, descriptions, shipping, and returns information

<!-- IDE-IGNORE-START -->
## Run on Intuned

[![Run on Intuned](https://cdn1.intuned.io/button.svg)](https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/e-commerece-category)

## Getting Started

To get started developing browser automation projects with Intuned, check out our [concepts and terminology](https://docs.intunedhq.com/docs/getting-started/conceptual-guides/core-concepts#runs%3A-executing-your-automations).


## Development

> **_NOTE:_**  All commands support `--help` flag to get more information about the command and its arguments and options.

### Install dependencies
```bash
uv sync
```

After installing dependencies, `intuned` command should be available in your environment.

### Run an API
```bash
uv run intuned run api ecommerece-category .parameters/api/ecommerece-category/default.json
uv run intuned run api ecommerece-list .parameters/api/ecommerece-list/default.json
uv run intuned run api ecommerece-details .parameters/api/ecommerece-details/default.json
```

### Save project
```bash
uv run intuned run save
```

Reference for saving project [here](https://docs.intunedhq.com/docs/02-features/local-development-cli#use-runtime-sdk-and-browser-sdk-helpers)

### Deploy project
```bash
uv run intuned deploy
```

### `intuned-browser`: Intuned Browser SDK

This project uses Intuned browser SDK. For more information, check out the [Intuned Browser SDK documentation](https://docs.intunedhq.com/automation-sdks/overview).

<!-- IDE-IGNORE-END -->




## Project Structure
```
/
├── .parameters/                      # Test parameters for APIs
│   └── api/
│       ├── ecommerece-category/
│       │   └── default.json
│       ├── ecommerece-list/
│       │   └── default.json
│       └── ecommerece-details/
│           └── default.json
├── api/                              # API endpoints
│   ├── ecommerece-category.py       # Scrape category links from menu
│   ├── ecommerece-list.py           # List products from category page
│   └── ecommerece-details.py        # Extract detailed product info
├── utils/                            # Utility modules
│   └── types_and_schemas.py         # Type definitions and Pydantic models
├── Intuned.jsonc                    # Intuned project configuration
└── pyproject.toml                   # Python project dependencies
```


## APIs

| API | Description |
|-----|-------------|
| `ecommerece-category` | Entry point that scrapes all category links from the store's main navigation menu. Automatically triggers `ecommerece-list` for each category using `extend_payload` |
| `ecommerece-list` | Scrapes product listings from a specific category page. Automatically triggers `ecommerece-details` for each product using `extend_payload` |
| `ecommerece-details` | Extracts comprehensive product information including title, price, available sizes, description, shipping details, and returns policy |


## Learn More

- [Intuned Documentation](https://docs.intunedhq.com)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [Web Scraping Recipe](https://docs.intunedhq.com/docs/01-learn/recipes/)
- [extend_payload Helper](https://docs.intunedhq.com/automation-sdks/intuned-sdk/python/helpers/functions/extend_payload)

