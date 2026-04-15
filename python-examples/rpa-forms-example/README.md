# rpa-forms-example (Python)

Insurance form filler using Stagehand in Intuned.

<!-- IDE-IGNORE-START -->
<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/rpa-forms-example" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>
<!-- IDE-IGNORE-END -->

## APIs

| API | Description |
| --- | ----------- |
| `insurance-form-filler` | Fills out a multi-step auto insurance quote form using Stagehand AI, given applicant, address, and vehicle details |

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

### Save project

```bash
intuned dev provision
```

### Deploy

```bash
intuned dev deploy

### Run an API

```bash
intuned dev run api insurance-form-filler .parameters/api/insurance-form-filler/default.json
intuned dev run api insurance-form-filler .parameters/api/insurance-form-filler/honda.json
```

```
<!-- IDE-IGNORE-END -->

## Project Structure

```
rpa-forms-example/
├── api/
│   └── insurance-form-filler.py       # Fills multi-step insurance quote form using Stagehand AI
├── hooks/
│   └── setup_context.py               # Stores CDP URL in attempt_store before each API call
├── utils/
│   └── types_and_schemas.py           # Pydantic models for request parameter validation
├── intuned-resources/
│   └── jobs/
│       └── insurance-form-filler.job.jsonc  # Job definition for insurance-form-filler API
├── .parameters/
│   └── api/
│       └── insurance-form-filler/
├── Intuned.jsonc
├── pyproject.toml
└── README.md
```

## Related

- [Intuned CLI](https://intunedhq.com/docs/main/05-references/cli/overview)
- [Intuned Browser SDK](https://intunedhq.com/docs/automation-sdks/overview)
- [Intuned llm.txt](https://intunedhq.com/docs/llms.txt)
