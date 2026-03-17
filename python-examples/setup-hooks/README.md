# Setup Hooks (Python)

Demonstrates how to use setup hooks to prepare data and configuration before API execution.

<!-- IDE-IGNORE-START -->
## Run on Intuned

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/setup-hooks" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>
<!-- IDE-IGNORE-END -->

## APIs

| API | Description |
| --- | ----------- |
| `demo-hook` | Demonstrates how setup hook data is passed to and used within an API handler |

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
intuned dev run api demo-hook .parameters/api/demo-hook/default.json
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
│   └── demo-hook.py          # Demo API showing hook data usage
├── hooks/
│   └── setup_context.py      # Main setup hook executed before API runs
├── utils/
│   └── types_and_schemas.py  # Pydantic models and type definitions
├── intuned-resources/
│   └── jobs/
│       └── demo-hook.job.jsonc  # Job definition for demo-hook API
├── .parameters/api/          # Test parameters
├── Intuned.jsonc             # Project config
├── pyproject.toml            # Python dependencies
└── README.md
```

## Related

- [Intuned CLI](https://docs.intunedhq.com/docs/05-references/cli/overview)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
