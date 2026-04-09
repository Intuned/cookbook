# bs4 Intuned project

E-commerce scraper using BeautifulSoup for HTML parsing to extract product listings and details with pagination support.

<!-- IDE-IGNORE-START -->
## Run on Intuned

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/bs4" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>

## Getting Started

### Install dependencies

```bash
uv sync
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
├── api/                      # Your API endpoints
│   ├── list.py               # API to scrape product listings with pagination
│   └── details.py            # API to extract detailed product information
├── utils/
│   └── types_and_schemas.py  # Pydantic models for type validation
├── intuned-resources/
│   └── jobs/
│       └── list.job.jsonc    # Top-level job example for the product list flow
├── .parameters/api/          # Parameter files for testing
├── Intuned.jsonc             # Intuned project configuration file
└── pyproject.toml            # Python project dependencies
```

### How It Works

1. **list.py** - Navigates to the listing page, extracts product title, price, and URL using BeautifulSoup, follows pagination links, and calls `extend_payload` to send each product to the details API.

2. **details.py** - Receives product data from list API, navigates to the product page, and extracts additional details (description, SKU, category, sizes, colors, images).

## Related

- [Intuned CLI](https://intunedhq.com/docs/main/05-references/cli/overview)
- [Intuned Browser SDK](https://intunedhq.com/docs/automation-sdks/overview)
- [Intuned llm.txt](https://intunedhq.com/docs/llms.txt)
