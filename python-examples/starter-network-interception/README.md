# starter-network-interception (Python)

Minimal starter showing how to capture API responses from a page by listening to network traffic.

<!-- IDE-IGNORE-START -->
<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/starter-network-interception" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>
<!-- IDE-IGNORE-END -->

## APIs

| API | Description |
| --- | ----------- |
| `sample-capture-api` | Navigates to a URL and captures all JSON responses whose URL matches the given pattern |

<!-- IDE-IGNORE-START -->
## Getting Started

### Install dependencies

```bash
uv sync
```

If the `intuned` CLI is not installed, install it globally:

```bash
npm install -g @intuned/cli
```

### Run an API

```bash
intuned dev run api sample-capture-api .parameters/api/sample-capture-api/default.json
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

## Project Structure

```
starter-network-interception/
├── api/
│   └── sample-capture-api.py                          # Captures API responses matching a URL pattern
├── intuned-resources/
│   └── jobs/
│       └── sample-capture-api.job.jsonc
├── .parameters/
│   └── api/
│       └── sample-capture-api/
│           └── default.json
├── Intuned.jsonc
├── pyproject.toml
└── README.md
```

## Related

- [Intuned CLI](https://intunedhq.com/docs/main/05-references/cli/overview)
- [Intuned Browser SDK](https://intunedhq.com/docs/automation-sdks/overview)
- [Intuned llm.txt](https://intunedhq.com/docs/llms.txt)
