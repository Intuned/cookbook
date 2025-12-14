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
│   │   ├── extract_structured_data.py  # Extract structured data from content
│   │   └── is_page_loaded.py           # Check if page is fully loaded
│   ├── click_until_exhausted.py        # Click button until no more content
│   ├── download_file.py                # Download files from URL or triggers
│   ├── extract_markdown.py             # Convert HTML to markdown
│   ├── filter_empty_values.py          # Remove empty values from data
│   ├── go_to_url.py                    # Navigate to URLs with options
│   ├── process_date.py                 # Parse various date formats
│   ├── resolve_url.py                  # Resolve relative URLs
│   ├── sanitize_html.py                # Clean and sanitize HTML
│   ├── save_file_to_s3.py              # Save files to S3
│   ├── scroll_to_load_content.py       # Scroll to load dynamic content
│   ├── upload_file_to_s3.py            # Upload files to S3
│   ├── validate_data_using_schema.py   # Validate data with Pydantic schemas
│   ├── wait_for_dom_settled.py         # Wait for DOM to stabilize
│   └── wait_for_network_settled.py     # Wait for network requests to settle
└── Intuned.jsonc                       # Intuned project configuration file
```

## SDK Helpers Showcase

### Navigation & Page Management
- **go_to_url**: Navigate to URLs with advanced options
- **wait_for_dom_settled**: Wait for DOM mutations to stabilize
- **wait_for_network_settled**: Wait for all network requests to complete

### Content Loading & Interaction
- **click_until_exhausted**: Click "Load More" buttons until all content is loaded
- **scroll_to_load_content**: Scroll to trigger lazy-loaded content

### Data Extraction & Processing
- **extract_markdown**: Convert HTML content to clean markdown
- **sanitize_html**: Clean and sanitize HTML content
- **filter_empty_values**: Remove null/empty values from objects
- **validate_data_using_schema**: Validate data against Pydantic schemas

### File Operations
- **download_file**: Download files from URLs or user interactions
- **upload_file_to_s3**: Upload files to S3 buckets
- **save_file_to_s3**: Save content directly to S3

### Utilities
- **process_date**: Parse various date formats into standardized format
- **resolve_url**: Resolve relative URLs to absolute URLs

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
