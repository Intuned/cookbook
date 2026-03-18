# E-Commerce Auth Product Scraper (Python)

Authenticated e-commerce scraping automation that extracts product information from a protected dashboard using Auth Sessions.

<!-- IDE-IGNORE-START -->
## Run on Intuned

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/e-commerce-auth-scrapingcourse" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>
<!-- IDE-IGNORE-END -->

## APIs

| API | Description |
| --- | ----------- |
| `list` | List products from the authenticated dashboard |
| `details` | Get detailed information for a specific product |

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
intuned dev run api list .parameters/api/list/default.json --auth-session test-auth-session
intuned dev run api details .parameters/api/details/default.json --auth-session test-auth-session
```

### Auth Sessions

```bash
# Create
intuned dev run authsession create .parameters/auth-sessions/create/default.json

# Validate
intuned dev run authsession validate test-auth-session

# Update
intuned dev run authsession update test-auth-session
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
│   ├── list.py                       # List products from the authenticated dashboard
│   └── details.py                    # Get detailed product information
├── auth-sessions/
│   ├── check.py                      # Validates if the auth session is still active
│   └── create.py                     # Creates/recreates the auth session
├── auth-sessions-instances/
│   └── test-auth-session/            # Example local auth session
│       ├── auth-session.json
│       └── metadata.json
├── utils/
│   └── types_and_schemas.py          # Python types and Pydantic models
├── intuned-resources/
│   ├── jobs/
│   │   └── list.job.jsonc            # Top-level job example for the list -> details flow
│   └── auth-sessions/
│       └── test-auth-session.auth-session.jsonc  # Auth session credentials
├── .parameters/api/                  # Test parameters
├── Intuned.jsonc                      # Project config
├── pyproject.toml                     # Python dependencies
└── README.md
```

## API Reference

### `list` — Product List Scraper

Scrapes products from the authenticated dashboard.

**Parameters:** None

**Returns:** List of products with:
- `name`: Product name
- `detailsUrl`: URL to product details page

**Features:**
- Requires authenticated session
- Automatically navigates to dashboard
- Triggers `details` API for each product using `extend_payload`

### `details` — Product Details Scraper

Scrapes detailed information for a specific product.

**Parameters:**
- `name`: Product name
- `detailsUrl`: URL to the product details page

**Returns:** Product details object with:
- `name`: Product name
- `price`: Product price
- `sku`: Stock Keeping Unit
- `category`: Product category
- `shortDescription`: Brief product description
- `fullDescription`: Complete product description
- `imageAttachments`: List of product images (uploaded to S3)
- `availableSizes`: List of available sizes
- `availableColors`: List of available colors
- `variants`: List of product variants with stock information

## Using `intuned_browser` SDK

This project uses the Intuned browser SDK for enhanced reliability:

- **`go_to_url`**: Navigate to URLs with automatic retries and intelligent timeout detection
- **`save_file_to_s3`**: Automatically upload images and files to S3 storage
- **`extend_payload`**: Trigger additional API calls dynamically (used to trigger `details` API for each product)

For more information, check out the [Intuned Browser SDK documentation](https://docs.intunedhq.com/automation-sdks/overview).

## Related

- [Intuned CLI](https://docs.intunedhq.com/docs/05-references/cli/overview)
- [Auth Sessions](https://docs.intunedhq.com/docs/02-features/auth-sessions)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
