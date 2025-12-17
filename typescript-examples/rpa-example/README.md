# RPA Example

A basic RPA example demonstrating consultation booking automation. This project shows how to automate form filling, data extraction, and interaction with web applications without authentication.

## Getting Started

To get started developing browser automation projects with Intuned, check out our [concepts and terminology](https://docs.intunedhq.com/docs/getting-started/conceptual-guides/core-concepts#runs%3A-executing-your-automations).


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

Run the APIs with the default parameters from the `.parameters` folder:

```bash
# Book a consultation
npm run intuned run api book-consultations .parameters/book-consultations/default.json

# Get consultations by email
npm run intuned run api get-consultations-by-email .parameters/get-consultations-by-email/default.json
```

Or with custom parameters:

```bash
# npm
npm run intuned run api <api-name> <parameters>

# yarn
yarn intuned run api <api-name> <parameters>
```

Example with inline parameters:
```bash
yarn intuned run api book-consultations '{"name":"John Doe","email":"john@example.com","phone":"+1-555-0123","date":"2024-12-25","time":"14:30","topic":"web-scraping"}'
```

### Deploy project
```bash
# npm
npm run intuned deploy

# yarn
yarn intuned deploy

```

## Environment Variables

This project uses environment variables for configuration. Create a `.env` file in the root directory based on `.env.example`:

```bash
INTUNED_API_KEY=your_api_key_here
```

### Variables:
- `INTUNED_API_KEY` - Your Intuned API key for authentication (required for deployment and production use)





## Project Structure
The project structure is as follows:
```
/
├── api/                          # Your API endpoints
│   ├── book-consultations.ts    # API to book a consultation
│   └── get-consultations-by-email.ts  # API to retrieve consultations by email
├── .parameters/                  # Test parameters for local development
│   ├── book-consultations/
│   │   └── default.json
│   └── get-consultations-by-email/
│       └── default.json
├── utils/                        # Shared utilities and schemas
│   └── typesAndSchemas.ts        # Zod schemas and TypeScript types
├── Intuned.jsonc                 # Intuned project configuration file
└── .env.example                  # Environment variables template
```


## APIs

This project includes two APIs:

### 1. book-consultations
Books a consultation appointment with the following parameters:
- `name` (string): Client's full name
- `email` (string): Client's email address
- `phone` (string): Client's phone number
- `date` (string): Consultation date (YYYY-MM-DD format)
- `time` (string): Consultation time (HH:MM format)
- `topic` (enum): Consultation topic - one of: "web-scraping", "data-extraction", "automation", "api-integration", "other"

**Returns:** Booking confirmation with success status, date, and message.

### 2. get-consultations-by-email
Retrieves all consultations for a specific email address.

**Parameters:**
- `email` (string): Email address to search for

**Returns:** Array of consultation objects with details including ID, status, client information, date, time, and topic.

## `Intuned.jsonc` Reference
```jsonc
{
  // Your Intuned workspace ID. 
  // Optional - If not provided here, it must be supplied via the `--workspace-id` flag during deployment.
  "workspaceId": "your_workspace_id",

  // The name of your Intuned project. 
  // Optional - If not provided here, it must be supplied via the command line when deploying.
  "projectName": "your_project_name",

  // API access settings
  "apiAccess": {
    // Whether to enable consumption through Intuned API. If this is false, the project can only be consumed through jobs.
    "enabled": true
  },

  // Auth session settings (disabled for this project)
  "authSessions": {
    // Whether auth sessions are enabled for this project.
    "enabled": false
  },

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

  // Whether to run the deployed API in a headful browser. Running in headful can help with some anti-bot detections. However, it requires more resources and may work slower or crash if the machine size is "standard".
  "headful": false,

  // The region where your Intuned project is hosted.
  // For a list of available regions, contact support or refer to the documentation.
  // Optional - Default: "us"
  "region": "us"
}
```
  