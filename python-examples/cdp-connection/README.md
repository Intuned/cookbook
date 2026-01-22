# cdp-connection Intuned project

Basic example demonstrating how to connect to a browser using Chrome DevTools Protocol (CDP)

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
uv run intuned run api connect-to-cdp .parameters/api/connect-to-cdp/default.json
```

### Save project

```bash
uv run intuned provision
```

### Deploy project

```bash
uv run intuned deploy
```

### `intuned-browser`: Intuned Browser SDK

This project uses Intuned browser SDK. For more information, check out the [Intuned Browser SDK documentation](https://docs.intunedhq.com/automation-sdks/overview).

## Project Structure

The project structure is as follows:

```text
/
├── api/                      # Your API endpoints
│   └── connect-to-cdp.py     # CDP connection example
├── hooks/                    # Setup hooks that run before API execution
│   └── setup_context.py      # Captures CDP URL from Intuned runtime
├── utils/                    # Utility functions and schemas
│   └── types_and_schemas.py  # Pydantic models and type definitions
├── .parameters/              # Parameter files for testing APIs
│   └── api/                  # API parameters folder
│       └── connect-to-cdp/   # Parameters for CDP connection API
│           └── default.json  # Default parameters (URL to navigate to)
└── Intuned.jsonc             # Intuned project configuration file
```

## Learn More

- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
