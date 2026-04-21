# starter-stagehand (Python)

Minimal starter showing how to drive a page with [Stagehand](https://github.com/browserbase/stagehand) on Intuned. Uses Intuned's managed AI gateway, so no API keys are needed locally beyond being linked to an Intuned workspace.

<!-- IDE-IGNORE-START -->
<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/starter-stagehand" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>
<!-- IDE-IGNORE-END -->

## APIs

| API | Description |
| --- | ----------- |
| `extract` | Navigate to a URL and extract structured data with a natural-language instruction |

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
intuned dev run api extract .parameters/api/extract/default.json
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
starter-stagehand/
├── api/
│   └── extract.py
├── intuned-resources/
│   └── jobs/
│       └── extract.job.jsonc
├── .parameters/
│   └── api/
│       └── extract/
│           └── default.json
├── Intuned.jsonc
├── pyproject.toml
└── README.md
```

## Related

- [Stagehand](https://github.com/browserbase/stagehand)
- [Intuned CLI](https://intunedhq.com/docs/main/05-references/cli/overview)
- [Intuned llm.txt](https://intunedhq.com/docs/llms.txt)
