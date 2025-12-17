# Stagehand Stock Details Template

This template demonstrates how to use Stagehand AI agent with Intuned to extract stock details from Nasdaq. The project uses Stagehand's AI capabilities to find and analyze stock information based on natural language criteria.

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

Run the stock details API with default parameters:
```bash
uv run intuned run api get_stock_details .parameters/get_stock_details/default.json
```

Or run with custom criteria:
```bash
uv run intuned run api get_stock_details '{"criteria": "highest market cap tech stock"}'
```

### Deploy project
```bash
uv run intuned deploy
```




### `intuned-browser`: Intuned Browser SDK

This project uses Intuned browser SDK. For more information, check out the [Intuned Browser SDK documentation](https://docs.intunedhq.com/automation-sdks/overview).


### `intuned-runtime`: Intuned Runtime SDK

All intuned projects use the Intuned runtime SDK. It also exposes some helpers for nested scheduling and auth sessions. This project uses some of these helpers. For more information, check out the documentation coming soon.

This project uses the `setup_context` hook from the Intuned runtime SDK. This hook is used to set up the browser context and page for the project. For more information, check out the documentation coming soon.


## Project Structure
The project structure is as follows:
```
/
├── .parameters/                      # Test parameters for APIs
│   └── get_stock_details/
│       └── default.json              # Default parameters for stock details API
├── api/                              # Your API endpoints
│   └── get_stock_details.py          # Stock details extraction API
├── hooks/                            # Runtime hooks
│   └── setup_context.py              # Sets up Stagehand context
├── .env.example                      # Example environment variables
├── Intuned.jsonc                     # Intuned project configuration file
├── pyproject.toml                    # Python project dependencies
└── README.md                         # This file
```


## Environment Variables

This project requires the following environment variables:

- `INTUNED_API_KEY`: Your Intuned API key (required for local development)
- `OPENAI_API_KEY`: (Optional) Your OpenAI API key for local development. When deployed to Intuned, the AI gateway configuration is provided automatically via `get_ai_gateway_config()` from runtime_helpers.

Copy `.env.example` to `.env` and fill in your API keys:
```bash
cp .env.example .env
```

Note: In production/deployed environments, the project automatically uses Intuned's AI gateway, so no OpenAI API key is needed.

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
    "enabled": true,

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
  