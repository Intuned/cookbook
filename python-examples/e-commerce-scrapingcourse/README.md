# e-commerce-scrapingcourse Intuned project

E-commerce scraping automation that extracts product information from an online store with pagination support.

## Key Features

- **Automatic Pagination**: The `list` API automatically handles pagination to scrape multiple pages
- **Dynamic API Chaining**: Uses `extend_payload` to automatically trigger the `details` API for each product found
- **S3 File Upload**: Product images are automatically uploaded to S3 using `save_file_to_s3`
- **Job Configuration**: Configured as a job template with retry logic and concurrent request handling

<!-- IDE-IGNORE-START -->

## Run on Intuned

Open this project in Intuned by clicking the button below.

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/e-commerce-scrapingcourse" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>

## Development

> **_NOTE:_** All commands support `--help` flag to get more information about the command and its arguments and options.

### Install dependencies

```bash
uv sync
```

After installing dependencies, `intuned` command should be available in your environment.

### Run an API

```bash
uv run intuned run api list .parameters/api/list/default.json
uv run intuned run api details .parameters/api/details/default.json
```

### Save project

```bash
uv run intuned save
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
├── .parameters/              # Test parameters for APIs
│   └── api/
│       ├── list/
│       │   └── default.json
│       └── details/
│           └── default.json
├── api/                      # API endpoints
│   ├── list.py              # Scrape product list with pagination
│   └── details.py           # Extract detailed product information
├── utils/                    # Utility modules
│   └── types_and_schemas.py # Type definitions and Pydantic models
├── Intuned.jsonc            # Intuned project configuration
└── pyproject.toml           # Python project dependencies
```

## APIs

| API       | Description                                                                                                                                             |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `list`    | Scrapes products from the e-commerce store with pagination support. Automatically triggers `details` API for each product using `extend_payload`        |
| `details` | Extracts detailed information for a specific product including price, SKU, category, descriptions, images (uploaded to S3), sizes, colors, and variants |

## Learn More

- [Intuned Documentation](https://docs.intunedhq.com)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [Web Scraping Recipe](https://docs.intunedhq.com/docs/01-learn/recipes/)
- [extend_payload Helper](https://docs.intunedhq.com/docs/05-references/runtime-sdk-python/extend-payload)
- [save_file_to_s3 Helper](https://docs.intunedhq.com/automation-sdks/intuned-sdk/python/helpers/functions/save_file_to_s3)
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
