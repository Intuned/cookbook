# Setup Hooks (TypeScript)

Demonstrates how to use setup hooks to prepare data and configuration before API execution.

## Run on Intuned

Open this project in Intuned by clicking the button below.

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/setup-hooks" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>

## APIs

| API | Description |
| --- | ----------- |
| `demo-hook` | Demonstrates how setup hook data is passed to and used within an API handler |

<!-- IDE-IGNORE-START -->
## Getting started

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
│   └── demo-hook.ts          # Demo API showing hook data usage
├── hooks/
│   └── setupContext.ts       # Main setup hook executed before API runs
├── utils/
│   └── typesAndSchemas.ts    # Zod schemas and TypeScript types
├── intuned-resources/
│   └── jobs/
│       └── demo-hook.job.jsonc  # Job definition for demo-hook API
├── .parameters/api/          # Test parameters
├── Intuned.jsonc             # Project config
├── package.json              # Node.js dependencies
└── README.md
```

## Related

- [Intuned CLI](https://docs.intunedhq.com/docs/05-references/cli/overview)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
