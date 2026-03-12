# E-Commerce Scrapingcourse (Python)

Basic e-commerce scraper using scrapingcourse.com.

## Run on Intuned

Open this project in Intuned by clicking the button below.

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/e-commerce-scrapingcourse" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>

## APIs

| API | Description |
| --- | ----------- |
| `list` | Scrapes products from the e-commerce store with pagination support. Automatically triggers `details` API for each product using `extend_payload` |
| `details` | Extracts detailed information for a specific product including price, SKU, category, descriptions, images (uploaded to S3), sizes, colors, and variants |

<!-- IDE-IGNORE-START -->

## Getting started

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

### Deploy

```bash
intuned dev deploy
```

<!-- IDE-IGNORE-END -->

## Project structure

```text
/
├── api/
│   ├── list.py                       # Scrapes product list with pagination
│   └── details.py                    # Extracts detailed product information
├── utils/
│   └── types_and_schemas.py          # Type definitions and Pydantic models
├── intuned-resources/
│   └── jobs/
│       ├── list.job.jsonc            # Job definition for list API
│       └── details.job.jsonc         # Job definition for details API
├── .parameters/api/                  # Test parameters
├── Intuned.jsonc                     # Project config
├── pyproject.toml                    # Python dependencies
└── README.md
```

## Key features

- **Automatic pagination**: The `list` API automatically handles pagination to scrape multiple pages
- **Dynamic API chaining**: Uses `extend_payload` to automatically trigger the `details` API for each product found
- **S3 file upload**: Product images are automatically uploaded to S3 using `save_file_to_s3`
- **Job configuration**: Configured as a job template with retry logic and concurrent request handling

## Related

- [Intuned CLI](https://docs.intunedhq.com/docs/05-references/cli/overview)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [Web Scraping Recipe](https://docs.intunedhq.com/docs/01-learn/recipes/)
- [extend_payload Helper](https://docs.intunedhq.com/docs/05-references/runtime-sdk-python/extend-payload)
- [save_file_to_s3 Helper](https://docs.intunedhq.com/automation-sdks/intuned-sdk/python/helpers/functions/save_file_to_s3)
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
