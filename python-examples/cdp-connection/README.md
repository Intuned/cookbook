# CDP Connection (Python)

Basic example demonstrating how to connect to a browser using Chrome DevTools Protocol (CDP) with Intuned.

<!-- IDE-IGNORE-START -->
## Run on Intuned

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/cdp-connection" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>
<!-- IDE-IGNORE-END -->

## APIs

| API | Description |
| ----- | ------------- |
| `connect-to-cdp` | Connect to browser via CDP, fetch browser info, navigate to a URL |

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
intuned dev run api connect-to-cdp .parameters/api/connect-to-cdp/default.json
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
│   └── connect-to-cdp.py         # CDP connection example
├── hooks/
│   └── setup_context.py          # Captures CDP URL from Intuned runtime
├── utils/
│   └── types_and_schemas.py      # Pydantic models and type definitions
├── intuned-resources/
│   └── jobs/
│       └── connect-cdp.job.jsonc # Job definition (schedule, payload)
├── .parameters/api/              # Test parameters
├── Intuned.jsonc                  # Project config
├── pyproject.toml                 # Python dependencies
└── README.md
```

## Related

- [Intuned CLI](https://docs.intunedhq.com/docs/05-references/cli/overview)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
