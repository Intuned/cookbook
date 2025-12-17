# playwright-basics-python-Intuned project

A collection of basic Python code examples for learning and reference.

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
# Run default API
uv run intuned run api default

# Run form submission example with parameters
uv run intuned run api examples/submit_form .parameters/param_fill_form/default.json

# Run pagination example with parameters
uv run intuned run api examples/naviate_n_pages .parameters/number_of_pages/default.json

# Run other examples
uv run intuned run api examples/scrape_list
uv run intuned run api examples/navigate_all_pages
uv run intuned run api examples/download_upload_files
```

### Deploy project
```bash
uv run intuned deploy
```

## Environment Variables

This project requires the following environment variables for local development:

- `INTUNED_API_KEY`: Your Intuned API key (required for running APIs locally)

Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

### `intuned-browser`: Intuned Browser SDK

This project uses Intuned browser SDK. For more information, check out the [Intuned Browser SDK documentation](https://docs.intunedhq.com/automation-sdks/overview).




## Project Structure
The project structure is as follows:
```
/
├── api/                           # Folder containing all your API endpoint logic
│   ├── default.py                  # Default or main API endpoint file
│   └── examples/                   # Folder with example scripts for reference or testing
│       ├── submit_form.py          # API example that demonstrates how to fill and submit forms
│       ├── scrape_list.py          # API example that shows how to scrape lists of data
│       ├── navigate_all_pages.py   # API example that shows how to navigate through all pages of a paginated site
│       ├── naviate_n_pages.py      # API example that shows how to navigate a specific number of pages
│       └── download_upload_files.py # API example that demonstrates file download and upload functionality
├── .parameters/                    # Test parameters for local development
│   ├── param_fill_form/            # Parameters for submit_form API
│   │   └── default.json
│   └── number_of_pages/            # Parameters for naviate_n_pages API
│       └── default.json
├── .env.example                    # Example environment variables file
└── Intuned.jsonc                   # Intuned project configuration file (defines project settings, environment, etc.)

```


## `Intuned.jsonc` Reference
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

  // Auth session settings
  "authSessions": {
    // Whether auth sessions are enabled for this project.
    // If enabled, "auth-sessions/check.ts" API must be implemented to validate the auth session.
    "enabled": false,

    // Whether to save Playwright traces for auth session runs.
    "saveTraces": false,

    // The type of auth session to use.
    // "API" type requires implementing "auth-sessions/create.ts" API to create/recreate the auth session programmatically.
    // "MANUAL" type uses a recorder to manually create the auth session.
    "type": "API",
    

    // Recorder start URL for the recorder to navigate to when creating the auth session.
    // Required if "type" is "MANUAL". Not used if "type" is "API".
    "startUrl": "https://example.com/login",

    // Recorder finish URL for the recorder. Once this URL is reached, the recorder stops and saves the auth session.
    // Required if "type" is "MANUAL". Not used if "type" is "API".
    "finishUrl": "https://example.com/dashboard",

    // Recorder browser mode
    // "fullscreen": Launches the browser in fullscreen mode.
    // "kiosk": Launches the browser in kiosk mode (no address bar, no navigation controls).
    // Only applicable for "MANUAL" type.
    "browserMode": "fullscreen"
  }
  
  // API access settings
  "apiAccess": {
    // Whether to enable consumption through Intuned API. If this is false, the project can only be consumed through jobs.
    // This is required for projects that use auth sessions.
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

