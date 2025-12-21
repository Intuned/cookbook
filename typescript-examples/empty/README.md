# default Intuned project

Empty Intuned project

## Getting Started

To get started developing browser automation projects with Intuned, check out the 
- Intuned docs [here](https://docs.intunedhq.com/docs/00-getting-started/introduction)
- CLI docs [here](https://docs.intunedhq.com/docs/05-references/cli)
- Intuned.jsonc docs [here](https://docs.intunedhq.com/docs/05-references/intuned-json#intuned-json)


## Development

> **_NOTE:_**  All commands support `--help` flag to get more information about the command and its arguments and options.

### Install dependencies
```bash
# npm
npm install

# yarn
yarn
```

> **_NOTE:_**  If you are using `npm`, make sure to pass `--` when using options with the `intuned` command.


### Run an API

```bash
# npm
npm run intuned run api sample .parameters/api/sample/default.json

# yarn
yarn intuned run api sample .parameters/api/sample/default.json
```

### Save project

```bash
# npm
npm run intuned run save

# yarn
yarn intuned run save
```

### Deploy project
```bash
# npm
npm run intuned deploy

# yarn
yarn intuned deploy

```


### `@intuned/browser`: Intuned Browser SDK

This project uses Intuned browser SDK. For more information, check out the [Intuned Browser SDK documentation](https://docs.intunedhq.com/automation-sdks/intuned-sdk/overview).




## Project Structure
The project structure is as follows:
```
/
├── api/                      # Your API endpoints
│   └── sample.ts             # Sample API endpoint
├── .parameters/              # Parameter files for testing APIs
│   └── api/                  # API parameters folder
│       └── sample/           # Parameters for sample API
│           └── default.json  # Default parameters
└── Intuned.jsonc             # Intuned project configuration file
```


## Envs

This project requires the following environment variables:

- `INTUNED_API_KEY`: Your Intuned API key for authentication. Get it from [Intuned Dashboard](https://dashboard.intunedhq.com)


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
  