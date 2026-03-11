# rpa-forms-example (TypeScript)

Insurance form filler using Stagehand in Intuned.

<!-- IDE-IGNORE-START -->
<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/rpa-forms-example" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>
<!-- IDE-IGNORE-END -->

## APIs

| API | Description |
| --- | ----------- |
| `insurance-form-filler` | Fills out a multi-step auto insurance quote form using Stagehand AI, given applicant, address, and vehicle details |

<!-- IDE-IGNORE-START -->
## Getting Started

### Install dependencies

```bash
npm install
# or
yarn
```

If the `intuned` CLI is not installed, install it globally:

```bash
npm install -g @intuned/cli
```

After installing dependencies, `intuned` command should be available in your environment.

### Run an API

```bash
intuned dev run api insurance-form-filler .parameters/api/insurance-form-filler/default.json
intuned dev run api insurance-form-filler .parameters/api/insurance-form-filler/honda.json
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
rpa-forms-example/
├── api/
│   └── insurance-form-filler.ts       # Fills multi-step insurance quote form using Stagehand AI
├── hooks/
│   └── setupContext.ts                # Stores CDP URL in attemptStore before each API call
├── utils/
│   └── typesAndSchemas.ts             # Zod schemas for request parameter validation
├── intuned-resources/
│   └── jobs/
│       └── insurance-form-filler.job.jsonc  # Job definition for insurance-form-filler API
├── .parameters/
│   └── api/
│       └── insurance-form-filler/
├── Intuned.jsonc
├── package.json
└── README.md
```

## Related

- [Intuned CLI](https://docs.intunedhq.com/docs/05-references/cli/overview)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
