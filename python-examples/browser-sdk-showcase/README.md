# Browser SDK Showcase (Python)

Showcase of Intuned Browser SDK helper functions for common automation tasks.

<!-- IDE-IGNORE-START -->
## Run on Intuned

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/browser-sdk-showcase" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>
<!-- IDE-IGNORE-END -->

## APIs

| API | Description |
| --- | ----------- |
| `click-until-exhausted` | Click a button repeatedly until it's exhausted or disappears |
| `download-file` | Download files from a URL or triggered by a page interaction |
| `extract-markdown` | Convert page HTML content to clean markdown |
| `filter-empty-values` | Remove null and empty values from objects and lists |
| `go-to-url` | Navigate to a URL with configurable timeout and retry options |
| `process-date` | Parse date strings in various formats to a standardized output |
| `resolve-url` | Resolve relative URLs to absolute URLs |
| `sanitize-html` | Clean and sanitize HTML content |
| `save-file-to-s3` | Save a downloaded file directly to S3 |
| `scroll-to-load-content` | Scroll the page to trigger lazy-loaded content |
| `upload-file-to-s3` | Download a file and upload it to S3 |
| `validate-data-using-schema` | Validate structured data against a Pydantic schema |
| `wait-for-dom-settled` | Wait for DOM mutations to stabilize before proceeding |
| `wait-for-network-settled` | Wait for all network requests to complete |
| `ai/extract-structured-data` | Extract structured data from page content using AI |
| `ai/is-page-loaded` | Use AI to determine if a page has finished loading |

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

### Setup for AI helpers

The `ai/extract-structured-data` and `ai/is-page-loaded` APIs use Intuned's AI gateway and require the project to be saved before running.

1. Add your workspace ID and project name to `Intuned.jsonc`:

   ```jsonc
   {
     "workspaceId": "your-workspace-id",
     "projectName": "your-project-name"
   }
   ```

2. Set your Intuned API key:

   ```bash
   export INTUNED_API_KEY=your-api-key
   ```

3. Save the project:

   ```bash
   intuned dev provision
   ```

### Run an API

```bash
intuned dev run api click-until-exhausted .parameters/api/click-until-exhausted/default.json
intuned dev run api download-file .parameters/api/download-file/default.json
intuned dev run api extract-markdown .parameters/api/extract-markdown/default.json
intuned dev run api filter-empty-values .parameters/api/filter-empty-values/default.json
intuned dev run api go-to-url .parameters/api/go-to-url/default.json
intuned dev run api process-date .parameters/api/process-date/default.json
intuned dev run api resolve-url .parameters/api/resolve-url/default.json
intuned dev run api sanitize-html .parameters/api/sanitize-html/default.json
intuned dev run api save-file-to-s3 .parameters/api/save-file-to-s3/default.json
intuned dev run api scroll-to-load-content .parameters/api/scroll-to-load-content/default.json
intuned dev run api upload-file-to-s3 .parameters/api/upload-file-to-s3/default.json
intuned dev run api validate-data-using-schema .parameters/api/validate-data-using-schema/default.json
intuned dev run api wait-for-dom-settled .parameters/api/wait-for-dom-settled/default.json
intuned dev run api wait-for-network-settled .parameters/api/wait-for-network-settled/default.json
intuned dev run api ai/extract-structured-data .parameters/api/ai/extract-structured-data/default.json
intuned dev run api ai/is-page-loaded .parameters/api/ai/is-page-loaded/default.json
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
├── api/                                        # Browser SDK helper examples
│   ├── ai/                                     # AI-powered helpers (requires project save)
│   │   ├── extract-structured-data.py          # Extract structured data from content using AI
│   │   └── is-page-loaded.py                   # Check if page is fully loaded using AI
│   ├── click-until-exhausted.py                # Click button until no more content loads
│   ├── download-file.py                        # Download files from URL or triggers
│   ├── extract-markdown.py                     # Convert HTML to markdown
│   ├── filter-empty-values.py                  # Remove empty values from data structures
│   ├── go-to-url.py                            # Navigate to URLs with retry options
│   ├── process-date.py                         # Parse various date formats
│   ├── resolve-url.py                          # Resolve relative URLs to absolute
│   ├── sanitize-html.py                        # Clean and sanitize HTML
│   ├── save-file-to-s3.py                      # Save files to S3
│   ├── scroll-to-load-content.py               # Scroll to load dynamic content
│   ├── upload-file-to-s3.py                    # Upload files to S3
│   ├── validate-data-using-schema.py           # Validate data with Pydantic schemas
│   ├── wait-for-dom-settled.py                 # Wait for DOM mutations to stabilize
│   └── wait-for-network-settled.py             # Wait for network requests to settle
├── intuned-resources/
│   └── jobs/                                   # Job definitions for each API
├── .parameters/api/                            # Test parameters
├── Intuned.jsonc                               # Project config
├── pyproject.toml                              # Python dependencies
└── README.md
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

- **extract-structured-data**: Extract structured data using AI from unstructured content
- **is-page-loaded**: Use AI to determine if a page has finished loading

## Related

- [Intuned CLI](https://docs.intunedhq.com/docs/05-references/cli/overview)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [Intuned Browser SDK — Python helpers](https://docs.intunedhq.com/automation-sdks/intuned-sdk/python/helpers/functions/)
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
