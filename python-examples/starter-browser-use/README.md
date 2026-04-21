# starter-browser-use (Python)

Minimal starter showing how to run [browser-use](https://github.com/browser-use/browser-use) on Intuned. Uses Intuned's managed AI gateway, so no API keys are required locally beyond being linked to an Intuned workspace.

<!-- IDE-IGNORE-START -->
<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/starter-browser-use" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>
<!-- IDE-IGNORE-END -->

## APIs

| API | Description |
| --- | ----------- |
| `run-agent` | Run a natural-language task on the browser using browser-use |

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
intuned dev run api run-agent .parameters/api/run-agent/default.json
```

Requires the project to be linked to an Intuned workspace so the AI gateway credentials resolve.

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
starter-browser-use/
├── api/
│   └── run-agent.py
├── intuned-resources/
│   └── jobs/
│       └── run-agent.job.jsonc
├── .parameters/
│   └── api/
│       └── run-agent/
│           └── default.json
├── Intuned.jsonc
├── pyproject.toml
└── README.md
```

## Related

- [browser-use](https://github.com/browser-use/browser-use)
- [Intuned CLI](https://intunedhq.com/docs/main/05-references/cli/overview)
- [Intuned llm.txt](https://intunedhq.com/docs/llms.txt)
