# Browser SDK Showcase (TypeScript)

Showcase of Intuned Browser SDK helper functions for common automation tasks.

## Run on Intuned

Open this project in Intuned by clicking the button below.

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/browser-sdk-showcase" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>

## APIs

| API | Description |
| --- | ----------- |
| `click-until-exhausted` | Click "Load More" buttons until all content is loaded |
| `download-file` | Download files from URLs or user interactions |
| `extract-markdown` | Convert HTML content to clean markdown |
| `filter-empty-values` | Remove null/empty values from objects |
| `go-to-url` | Navigate to URLs with advanced options |
| `process-date` | Parse various date formats into standardized format |
| `resolve-url` | Resolve relative URLs to absolute URLs |
| `sanitize-html` | Clean and sanitize HTML content |
| `save-file-to-s3` | Save content directly to S3 |
| `scroll-to-load-content` | Scroll to trigger lazy-loaded content |
| `upload-file-to-s3` | Upload files to S3 |
| `validate-data-using-schema` | Validate data against Zod schemas |
| `wait-for-dom-settled` | Wait for DOM mutations to stabilize |
| `wait-for-network-settled` | Wait for all network requests to complete |
| `ai/extract-structured-data` | Extract structured data using AI from unstructured content |
| `ai/is-page-loaded` | Use AI to determine if a page has finished loading |

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
├── api/                                              # Browser SDK helper examples
│   ├── ai/                                           # AI-powered helpers (requires project save)
│   │   ├── extract-structured-data.ts               # Extract structured data using AI
│   │   └── is-page-loaded.ts                        # Check if page is fully loaded using AI
│   ├── click-until-exhausted.ts                     # Click button until no more content
│   ├── download-file.ts                             # Download files from URL or triggers
│   ├── extract-markdown.ts                          # Convert HTML to markdown
│   ├── filter-empty-values.ts                       # Remove empty values from data
│   ├── go-to-url.ts                                 # Navigate to URLs with options
│   ├── process-date.ts                              # Parse various date formats
│   ├── resolve-url.ts                               # Resolve relative URLs
│   ├── sanitize-html.ts                             # Clean and sanitize HTML
│   ├── save-file-to-s3.ts                           # Save files to S3
│   ├── scroll-to-load-content.ts                    # Scroll to load dynamic content
│   ├── upload-file-to-s3.ts                         # Upload files to S3
│   ├── validate-data-using-schema.ts                # Validate data with Zod schemas
│   ├── wait-for-dom-settled.ts                      # Wait for DOM to stabilize
│   └── wait-for-network-settled.ts                  # Wait for network requests to settle
├── intuned-resources/                               # Intuned platform resources
│   └── jobs/                                        # Job configurations for each API
│       ├── ai/
│       │   ├── extract-structured-data.job.jsonc
│       │   └── is-page-loaded.job.jsonc
│       ├── click-until-exhausted.job.jsonc
│       ├── download-file.job.jsonc
│       ├── extract-markdown.job.jsonc
│       ├── filter-empty-values.job.jsonc
│       ├── go-to-url.job.jsonc
│       ├── process-date.job.jsonc
│       ├── resolve-url.job.jsonc
│       ├── sanitize-html.job.jsonc
│       ├── save-file-to-s3.job.jsonc
│       ├── scroll-to-load-content.job.jsonc
│       ├── upload-file-to-s3.job.jsonc
│       ├── validate-data-using-schema.job.jsonc
│       ├── wait-for-dom-settled.job.jsonc
│       └── wait-for-network-settled.job.jsonc
├── .parameters/                                     # Test parameters for APIs
│   └── api/                                         # API parameters folder
│       ├── ai/                                      # AI helpers parameters
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
├── Intuned.jsonc                                    # Intuned project configuration file
├── package.json                                     # Node.js project dependencies
└── tsconfig.json                                    # TypeScript configuration
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
- **validate-data-using-schema**: Validate data against Zod schemas

### File Operations

- **download-file**: Download files from URLs or user interactions
- **upload-file-to-s3**: Upload files to S3 (uses Intuned's managed bucket via gateway by default, or your own S3 with credentials)
- **save-file-to-s3**: Save content directly to S3 (uses Intuned's managed bucket via gateway by default, or your own S3 with credentials)

### Utilities

- **process-date**: Parse various date formats into standardized format
- **resolve-url**: Resolve relative URLs to absolute URLs

### AI-Powered Helpers

**Setup Required:** The AI helpers require workspace setup and project save (see Setup for AI helpers section above).

- **extract-structured-data**: Extract structured data using AI from unstructured content
- **is-page-loaded**: Use AI to determine if a page has finished loading

## Related

- [Intuned CLI](https://docs.intunedhq.com/docs/05-references/cli/overview)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [Intuned Browser SDK — TypeScript helpers](https://docs.intunedhq.com/automation-sdks/intuned-sdk/typescript/helpers/functions/)
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
