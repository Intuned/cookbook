# rpa-forms-example Intuned project

AI-powered form automation using Stagehand to automatically fill out insurance quote forms with applicant, address, and object information.

## Run on Intuned

Open this project in Intuned by clicking the button below.

[![Run on Intuned](https://cdn1.intuned.io/button.svg)](https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/rpa-forms-example)

## Getting Started

To get started developing browser automation projects with Intuned, check out our [concepts and terminology](https://docs.intunedhq.com/docs/getting-started/conceptual-guides/core-concepts#runs%3A-executing-your-automations).

### Prerequisites

This project uses Stagehand for AI-powered form automation. You'll need to set the `OPENAI_API_KEY` environment variable:

```bash
export OPENAI_API_KEY=your_openai_api_key_here
```

## Development

> **_NOTE:_**  All commands support `--help` flag to get more information about the command and its arguments and options.

### Install Dependencies

```bash
# npm
npm install

# yarn
yarn
```

### Run the API Locally

```bash
# npm
npm run intuned run api insurance-form-filler .parameters/api/insurance-form-filler/default.json

# yarn
yarn intuned run api insurance-form-filler  .parameters/api/insurance-form-filler/default.json
```

### Save project

```bash
# npm
npm run intuned provision

# yarn
yarn intuned provision
```

### Deploy to Intuned

```bash
# npm
npm run intuned deploy

# yarn
yarn intuned deploy
```

### `intuned-browser`: Intuned Browser SDK

This project uses Intuned browser SDK. For more information, check out the [Intuned Browser SDK documentation](https://docs.intunedhq.com/automation-sdks/overview).

### `intuned-runtime`: Intuned Runtime SDK

All intuned projects use the Intuned runtime SDK. It also exposes some helpers for nested scheduling and auth sessions. This project uses some of these helpers. For more information, check out the documentation coming soon.

This project uses the `setupContext` hook from the Intuned runtime SDK. This hook is used to set up the browser context and page for the project. For more information, check out the documentation coming soon.

## Project Structure

The project structure is as follows:

```text
/
├── api/                      # Your API endpoints 
│   └── insurance-form-filler.ts   # Main automation API for filling insurance forms
├── hooks/                    # Setup hooks
│   └── setupContext.ts      # Browser context setup hook
├── utils/                    # Utility modules
│   └── typesAndSchemas.ts   # Zod schemas for type validation
├── Intuned.jsonc            # Intuned project configuration file
└── package.json             # Node.js project dependencies
```

### How It Works

1. **insurance-form-filler.ts** - Uses Stagehand's AI-powered automation to navigate to the insurance website, select insurance type, and fill out multi-step forms including:
   - Applicant information (name, date of birth, gender, marital status)
   - Contact details (email, phone, text preferences)
   - Address information (street, city, state, zip code)
   - Vehicle details (type, year, make, model, usage)
   - Additional preferences (multi-policy discount, current insurance status, coverage effective date)

   The automation uses natural language instructions to interact with form elements, making it resilient to UI changes.

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
  },

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
  },
  
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

## Learn More

- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
