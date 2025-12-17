# crawl4ai

Quick-start examples for using [crawl4ai](https://crawl4ai.com) on the Intuned platform.

This project serves as a reference for the [crawl4ai documentation](https://docs.crawl4ai.com/) tutorials, demonstrating how to integrate crawl4ai with Intuned's browser automation infrastructure.

## Project Structure

```
crawl4ai/
├── api/
│   ├── simple-crawl.py           # Single URL crawling
│   ├── deep-crawl.py              # Deep crawling with strategies
│   ├── multi-crawl.py             # Concurrent URL crawling
│   ├── content-selection/
│   │   ├── css-based.py           # CSS selector extraction
│   │   └── llm-based.py           # LLM-based extraction
│   └── adaptive-crawl/
│       ├── statistical.py         # Statistical adaptive crawling
│       └── embedding.py           # Embedding-based adaptive crawling
├── .parameters/                   # Test parameters for each API
│   ├── simple-crawl/
│   │   └── default.json
│   ├── deep-crawl/
│   │   └── default.json
│   ├── multi-crawl/
│   │   └── default.json
│   ├── content-selection/
│   │   ├── css-based/
│   │   │   └── default.json
│   │   └── llm-based/
│   │       └── default.json
│   └── adaptive-crawl/
│       ├── statistical/
│       │   └── default.json
│       └── embedding/
│           └── default.json
├── Intuned.jsonc                  # Intuned project configuration
├── pyproject.toml                 # Python dependencies
└── README.md
```

## APIs

### Core Crawling

| API | Description |
|-----|-------------|
| `simple-crawl` | Crawls a single URL and returns the page content as clean markdown |
| `deep-crawl` | Deep crawl a website following links with BFS, DFS, or Best-First strategies |
| `multi-crawl` | Crawl multiple URLs concurrently with dispatchers for rate limiting and memory management |

### Content Selection

| API | Description |
|-----|-------------|
| `content-selection/css-based` | Extract structured data from a webpage using CSS selectors with content filtering |
| `content-selection/llm-based` | Extract structured data using an LLM with a Pydantic schema |

### Adaptive Crawling

| API | Description |
|-----|-------------|
| `adaptive-crawl/statistical` | Adaptive crawling with statistical strategy (term-based analysis) |
| `adaptive-crawl/embedding` | Adaptive crawling with embedding strategy (semantic understanding) |

## Run API Examples

Run APIs locally using the Intuned CLI with test parameters:

```bash
# Core Crawling
intuned run api/simple-crawl.py --parameters .parameters/simple-crawl/default.json
intuned run api/deep-crawl.py --parameters .parameters/deep-crawl/default.json
intuned run api/multi-crawl.py --parameters .parameters/multi-crawl/default.json

# Content Selection
intuned run api/content-selection/css-based.py --parameters .parameters/content-selection/css-based/default.json
intuned run api/content-selection/llm-based.py --parameters .parameters/content-selection/llm-based/default.json

# Adaptive Crawling
intuned run api/adaptive-crawl/statistical.py --parameters .parameters/adaptive-crawl/statistical/default.json
intuned run api/adaptive-crawl/embedding.py --parameters .parameters/adaptive-crawl/embedding/default.json
```

## Environment Variables

Some APIs require environment variables. Copy `.env.example` to `.env` and fill in your values:

```bash
# Required for LLM-based content selection and embedding adaptive crawling
INTUNED_API_KEY=your_api_key_here
```

Note: For LLM-based APIs (`content-selection/llm-based`, `adaptive-crawl/embedding`), you'll also need to provide API keys in the parameters JSON (e.g., OpenAI API key for the LLM provider).

## Learn More

- [crawl4ai Documentation](https://docs.crawl4ai.com/)
- [Intuned Documentation](https://docs.intunedhq.com/)


### `intuned-browser`: Intuned Browser SDK

This project uses Intuned browser SDK. For more information, check out the [Intuned Browser SDK documentation](https://docs.intunedhq.com/automation-sdks/overview).


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
  