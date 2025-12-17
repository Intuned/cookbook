# rpa-auth-example

Authenticated consultation booking automation that demonstrates how to use Auth Sessions with credential-based authentication to book consultations and retrieve consultation data.

## Features

- Book consultations with name, email, phone, date, time, and topic
- Retrieve consultations by email address
- Credential-based authentication using Auth Sessions
- Separate APIs for auth session creation and validation

## Getting Started

To get started developing browser automation projects with Intuned, check out our [concepts and terminology](https://docs.intunedhq.com/docs/getting-started/conceptual-guides/core-concepts#runs%3A-executing-your-automations).

## Prerequisites

- Python 3.12 or higher
- uv package manager

## Development

> **_NOTE:_**  All commands support `--help` flag to get more information about the command and its arguments and options.

### Install dependencies
```bash
uv sync
```

After installing dependencies, `intuned` command should be available in your environment.

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
INTUNED_API_KEY=your_api_key_here
```

Required environment variables:
- `INTUNED_API_KEY`: Your Intuned API key for authentication

### Run an API

Run the book-consultations API:
```bash
uv run intuned run api book-consultations .parameters/book-consultations/default.json
```

Run the get-consultations-by-email API:
```bash
uv run intuned run api get-consultations-by-email .parameters/get-consultations-by-email/default.json
```

Additional parameter examples for book-consultations:
```bash
# Automation consultation
uv run intuned run api book-consultations .parameters/book-consultations/automation.json

# Data extraction consultation
uv run intuned run api book-consultations .parameters/book-consultations/data-extraction.json

# API integration consultation
uv run intuned run api book-consultations .parameters/book-consultations/api-integration.json

# Other topic consultation
uv run intuned run api book-consultations .parameters/book-consultations/other.json
```

### Test Auth Session

Test auth session creation:
```bash
uv run intuned auth-session test create .parameters/auth/create.json
```

Test auth session validation:
```bash
uv run intuned auth-session test check .parameters/auth/check.json
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
├── .parameters/                          # Parameter files for testing APIs locally
│   ├── auth/                             # Auth session parameters
│   │   ├── check.json                    # Parameters for checking auth session (empty)
│   │   └── create.json                   # Credentials for creating auth session
│   ├── book-consultations/               # Parameters for book-consultations API
│   │   ├── default.json                  # Default booking parameters
│   │   ├── automation.json               # Automation consultation example
│   │   ├── data-extraction.json          # Data extraction consultation example
│   │   ├── api-integration.json          # API integration consultation example
│   │   └── other.json                    # Other topic consultation example
│   └── get-consultations-by-email/       # Parameters for get-consultations-by-email API
│       └── default.json                  # Default email search parameters
├── api/                                  # Your API endpoints
│   ├── book-consultations.py             # Books a consultation with provided details
│   └── get-consultations-by-email.py     # Retrieves consultations by email address
├── auth-sessions/                        # Auth session related APIs
│   ├── check.py                          # Validates if the auth session is still valid
│   └── create.py                         # Creates/recreates the auth session programmatically
├── auth-sessions-instances/              # Auth session instances created and used by the CLI
│   └── ...
├── utils/                                # Utility modules
│   └── types_and_schemas.py              # Pydantic schemas for parameter validation
├── .env.example                          # Example environment variables file
├── Intuned.jsonc                         # Intuned project configuration file
├── pyproject.toml                        # Python project dependencies
└── README.md                             # This file
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
  