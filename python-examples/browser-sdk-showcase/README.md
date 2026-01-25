# Browser SDK Showcase

A comprehensive collection of browser automation helper functions from the Intuned Browser SDK. This project demonstrates various utilities for web scraping, data processing, file handling, and AI-powered operations.

<!-- IDE-IGNORE-START -->
## Run on Intuned

[![Run on Intuned](https://cdn1.intuned.io/button.svg)](https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/browser-sdk-showcase)

## Getting Started

To get started developing browser automation projects with Intuned, check out our [Quick Starts Guide](https://docs.intunedhq.com/docs/00-getting-started/quickstarts).

## Development

> **_NOTE:_** All commands support `--help` flag to get more information about the command and its arguments and options.

### Setup (Required for AI Helpers)

**Important:** The AI-powered helpers (`ai/extract-structured-data` and `ai/is-page-loaded`) use Intuned's AI gateway, which requires the project to be saved before running.

If you plan to use the AI helpers, you need to set up your Intuned workspace:

1. **Create a workspace** - Follow the [workspace management guide](https://docs.intunedhq.com/docs/03-how-to/manage/manage-workspace) to create your Intuned workspace

2. **Get your API key** - Generate an API key from the [API keys page](https://docs.intunedhq.com/docs/03-how-to/manage/manage-api-keys#how-to-manage-api-keys) in your Intuned dashboard

3. **Configure workspace ID** - Add your workspace ID and Project Name to `Intuned.jsonc`:

   ```jsonc
   {
     "workspaceId": "your-workspace-id",
     "projectName": "your-project-name"
     // ... rest of config
   }
   ```

4. **Set environment variable** - Add your API key as an environment variable:

   ```bash
   export INTUNED_API_KEY=your-api-key
   ```

### Install dependencies

```bash
uv sync
```

After installing dependencies, `intuned` command should be available in your environment.

### Initialize project (Required for AI Helpers)

If you plan to use AI helpers, run the save command to upload your project and set up the required `.env` file:

```bash
uv run intuned provision
```

This configures your local environment and prepares the AI gateway for running AI-powered helpers.

Reference for saving project [here](https://docs.intunedhq.com/docs/02-features/local-development-cli#use-runtime-sdk-and-browser-sdk-helpers)

### Run an API

```bash
uv run intuned run api click-until-exhausted .parameters/api/click-until-exhausted/default.json
uv run intuned run api download-file .parameters/api/download-file/default.json
uv run intuned run api extract-markdown .parameters/api/extract-markdown/default.json
uv run intuned run api filter-empty-values .parameters/api/filter-empty-values/default.json
uv run intuned run api go-to-url .parameters/api/go-to-url/default.json
uv run intuned run api process-date .parameters/api/process-date/default.json
uv run intuned run api resolve-url .parameters/api/resolve-url/default.json
uv run intuned run api sanitize-html .parameters/api/sanitize-html/default.json
uv run intuned run api save-file-to-s3 .parameters/api/save-file-to-s3/default.json
uv run intuned run api scroll-to-load-content .parameters/api/scroll-to-load-content/default.json
uv run intuned run api upload-file-to-s3 .parameters/api/upload-file-to-s3/default.json
uv run intuned run api validate-data-using-schema .parameters/api/validate-data-using-schema/default.json
uv run intuned run api wait-for-dom-settled .parameters/api/wait-for-dom-settled/default.json
uv run intuned run api wait-for-network-settled .parameters/api/wait-for-network-settled/default.json
uv run intuned run api ai/extract-structured-data .parameters/api/ai/extract-structured-data/default.json
uv run intuned run api ai/is-page-loaded .parameters/api/ai/is-page-loaded/default.json
```

### Deploy project

```bash
uv run intuned deploy
```
<!-- IDE-IGNORE-END -->

## Project Structure

```text
/
├── api/                          # Browser SDK helper examples
│   ├── ai/                       # AI-powered helpers (requires API keys & credits)
│   │   ├── extract-structured-data.py  # Extract structured data from content
│   │   └── is-page-loaded.py           # Check if page is fully loaded
│   ├── click-until-exhausted.py        # Click button until no more content
│   ├── download-file.py                # Download files from URL or triggers
│   ├── extract-markdown.py             # Convert HTML to markdown
│   ├── filter-empty-values.py          # Remove empty values from data
│   ├── go-to-url.py                    # Navigate to URLs with options
│   ├── process-date.py                 # Parse various date formats
│   ├── resolve-url.py                  # Resolve relative URLs
│   ├── sanitize-html.py                # Clean and sanitize HTML
│   ├── save-file-to-s3.py              # Save files to S3
│   ├── scroll-to-load-content.py       # Scroll to load dynamic content
│   ├── upload-file-to-s3.py            # Upload files to S3
│   ├── validate-data-using-schema.py   # Validate data with Pydantic schemas
│   ├── wait-for-dom-settled.py         # Wait for DOM to stabilize
│   └── wait-for-network-settled.py     # Wait for network requests to settle
├── .parameters/                  # Test parameters for APIs
│   └── api/                      # API parameters folder
│       ├── ai/                   # AI helpers parameters
│       │   ├── extract-structured-data/
│       │   │   └── default.json
│       │   └── is-page-loaded/
│       │       └── default.json
│       ├── click-until-exhausted/
│       │   └── default.json
│       ├── download-file/
│       │   └── default.json
│       ├── extract-markdown/
│       │   └── default.json
│       ├── filter-empty-values/
│       │   └── default.json
│       ├── go-to-url/
│       │   └── default.json
│       ├── process-date/
│       │   └── default.json
│       ├── resolve-url/
│       │   └── default.json
│       ├── sanitize-html/
│       │   └── default.json
│       ├── save-file-to-s3/
│       │   └── default.json
│       ├── scroll-to-load-content/
│       │   └── default.json
│       ├── upload-file-to-s3/
│       │   └── default.json
│       ├── validate-data-using-schema/
│       │   └── default.json
│       ├── wait-for-dom-settled/
│       │   └── default.json
│       └── wait-for-network-settled/
│           └── default.json
├── Intuned.jsonc                 # Intuned project configuration file
└── pyproject.toml                # Python project dependencies
```

## SDK Helpers Showcase

### Navigation & Page Management

- **go-to-url**: Navigate to URLs with advanced options
- **wait-for-dom-settled**: Wait for DOM mutations to stabilize
- **wait-for-network-settled**: Wait for all network requests to complete

### Content Loading & Interaction

- **click-until-exhausted**: Click "Load More" buttons until all content is loaded
- **scroll-to-load-content**: Scroll to trigger lazy-loaded content

### Data Extraction & Processing

- **extract-markdown**: Convert HTML content to clean markdown
- **sanitize-html**: Clean and sanitize HTML content
- **filter-empty-values**: Remove null/empty values from objects
- **validate-data-using-schema**: Validate data against Pydantic schemas

### File Operations

- **download-file**: Download files from URLs or user interactions
- **upload-file-to-s3**: Upload files to S3 (uses Intuned's managed bucket via gateway by default, or your own S3 with credentials)
- **save-file-to-s3**: Save content directly to S3 (uses Intuned's managed bucket via gateway by default, or your own S3 with credentials)

### Utilities

- **process-date**: Parse various date formats into standardized format
- **resolve-url**: Resolve relative URLs to absolute URLs

### AI-Powered Helpers

**⚠️ Setup Required:** The AI helpers require workspace setup and project save (see Setup section above).

- **extract-structured-data**: Extract structured data using AI from unstructured content
- **is-page-loaded**: Use AI to determine if a page has finished loading

## Learn More

For detailed documentation on each helper function, visit:

- [Intuned Browser SDK - Python](https://docs.intunedhq.com/automation-sdks/intuned-sdk/python/helpers/functions/)
- [Browser SDK Overview](https://docs.intunedhq.com/automation-sdks/overview)
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
