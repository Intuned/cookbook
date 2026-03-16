# Network Interception (Python)

Network request interception for API data extraction.

## Run on Intuned

Open this project in Intuned by clicking the button below.

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/network-interception" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>

## APIs

| API | Description |
| --- | ----------- |
| `network-interceptor` | Logs in to a website, intercepts outgoing requests to capture CSRF tokens, and makes authenticated API calls |
| `api-interceptor` | Intercepts API responses while paginating through pages to capture all data from paginated endpoints |

<!-- IDE-IGNORE-START -->
## Getting started

### Install dependencies

```bash
uv sync
```

If the `intuned` CLI is not installed, install it globally:

```bash
npm install -g @intuned/cli
```

After installing dependencies, `intuned` command should be available in your environment.

### Run an API

```bash
intuned dev run api network-interceptor .parameters/api/network-interceptor/default.json
intuned dev run api api-interceptor .parameters/api/api-interceptor/default.json
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
├── api/
│   ├── network-interceptor.py        # CSRF token capture and authenticated API calls
│   └── api-interceptor.py            # Paginated API response interception
├── utils/
│   └── types_and_schemas.py          # Pydantic models for type validation
├── intuned-resources/
│   └── jobs/
│       ├── network-interceptor.job.jsonc  # Job for CSRF interceptor
│       └── api-interceptor.job.jsonc      # Job for paginated API interceptor
├── .parameters/api/                  # Test parameters
├── Intuned.jsonc                     # Project config
├── pyproject.toml                    # Python dependencies
└── README.md
```

## How it works

### `network-interceptor` (CSRF token capture)

1. Logs in to the target website using provided credentials
2. Sets up a request interceptor to capture CSRF tokens from outgoing requests
3. Navigates to the target URL and waits for network activity
4. Captures the CSRF token from request headers (e.g., `x-csrftoken`)
5. Makes authenticated API calls using the captured token

### `api-interceptor` (paginated API data)

1. Sets up a response listener for a specified API pattern
2. Navigates to the URL and captures initial data from matching API responses
3. Clicks the "Next" button to load more pages
4. Aggregates all captured data and returns it

## Related

- [Intuned CLI](https://docs.intunedhq.com/docs/05-references/cli/overview)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
