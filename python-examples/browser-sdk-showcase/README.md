# Browser SDK Showcase

A comprehensive collection of browser automation helper functions from the Intuned Browser SDK. This project demonstrates various utilities for web scraping, data processing, file handling, and AI-powered operations.

## Getting Started

To get started developing browser automation projects with Intuned, check out our [concepts and terminology](https://docs.intunedhq.com/docs/getting-started/conceptual-guides/core-concepts#runs%3A-executing-your-automations).


## Development

> **_NOTE:_** All commands support `--help` flag to get more information about the command and its arguments and options.

### Install dependencies
```bash
uv sync
```

After installing dependencies, `intuned` command should be available in your environment.

### Run an API
```bash
uv run intuned run api <api-name> <parameters>
```

### Deploy project
```bash
uv run intuned deploy
```




### `intuned-browser`: Intuned Browser SDK

This project uses Intuned browser SDK. For more information, check out the [Intuned Browser SDK documentation](https://docs.intunedhq.com/automation-sdks/overview).




## Project Structure
The project structure is as follows:
```
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
└── Intuned.jsonc                       # Intuned project configuration file
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
- **upload-file-to-s3**: Upload files to S3 buckets
- **save-file-to-s3**: Save content directly to S3

### Utilities
- **process-date**: Parse various date formats into standardized format
- **resolve-url**: Resolve relative URLs to absolute URLs

### AI-Powered Helpers
See [ai/README.md](./api/ai/README.md) for AI helpers that require API keys and use AI credits.


## `Intuned.json` Reference
```jsonc
{
  // Your Intuned workspace ID. 
  // Optional - If not provided here, it must be supplied via the `--workspace-id` flag during deployment.
  "workspaceId": "your_workspace_id",

  // The name of your Intuned project. 
  // Optional - If not provided here, it must be supplied via the command line when deploying.
  "projectName": "your_project_name",

  // Replication settings
  "replication": {
    // The maximum number of concurrent executions allowed via Intuned API. This does not affect jobs.
    // A number of machines equal to this will be allocated to handle API requests.
    // Not applicable if api access is disabled.
    "maxConcurrentRequests": 1,

    // The machine size to use for this project. This is applicable for both API requests and jobs.
    // "standard": Standard machine size (6 shared vCPUs, 2GB RAM)
    // "large": Large machine size (8 shared vCPUs, 4GB RAM)
    // "xlarge": Extra large machine size (1 performance vCPU, 8GB RAM)
    "size": "standard"
  }

  // API access settings
  "apiAccess": {
    // Whether to enable consumption through Intuned API. If this is false, the project can only be consumed through jobs.
    "enabled": true
  },

  // Whether to run the deployed API in a headful browser. Running in headful can help with some anti-bot detections. However, it requires more resources and may work slower or crash if the machine size is "standard".
  "headful": false,

  // The region where your Intuned project is hosted.
  // For a list of available regions, contact support or refer to the documentation.
  // Optional - Default: "us"
  "region": "us"
}
```

## Documentation

For detailed documentation on each helper function, visit:
- [Intuned Browser SDK - Python](https://docs.intunedhq.com/automation-sdks/intuned-sdk/python/helpers/functions/)
- [Browser SDK Overview](https://docs.intunedhq.com/automation-sdks/intuned-sdk/overview)
