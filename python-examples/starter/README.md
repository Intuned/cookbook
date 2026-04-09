# starter (Python)

Default Intuned project template for browser automation.

<!-- IDE-IGNORE-START -->
<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/starter" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>
<!-- IDE-IGNORE-END -->

## APIs

| API | Description |
| --- | ----------- |
| `sample` | Minimal API scaffold — rename, add parameters, and write your automation logic |

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

After installing dependencies, `intuned` command should be available in your environment.

### Run an API

```bash
intuned dev run api sample .parameters/api/sample/default.json
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
starter/
├── api/
│   └── sample.py                      # Minimal API scaffold to build from
├── intuned-resources/
│   └── jobs/
│       └── sample.job.jsonc           # Job definition for sample API
├── .parameters/
│   └── api/
│       └── sample/
├── Intuned.jsonc
├── pyproject.toml
└── README.md
```

## Related

- [Intuned CLI](https://intunedhq.com/docs/main/05-references/cli/overview)
- [Intuned Browser SDK](https://intunedhq.com/docs/automation-sdks/overview)
- [Intuned llm.txt](https://intunedhq.com/docs/llms.txt)
