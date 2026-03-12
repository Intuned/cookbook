# setup-hooks Intuned project

Example demonstrating how to use setup hooks in Intuned to prepare data and configuration before your API executes

<!-- IDE-IGNORE-START -->
## Run on Intuned

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/setup-hooks" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>

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
intuned dev run api demo-hook .parameters/api/demo-hook/default.json
```

### Save project

```bash
intuned dev provision
```

### Deploy project

```bash
intuned dev deploy
```
<!-- IDE-IGNORE-END -->

## Project Structure

The project structure is as follows:

```text
/
├── api/                      # Your API endpoints
│   └── demo-hook.ts          # Demo API showing hook data usage
├── hooks/                    # Setup hooks executed before API runs
│   └── setupContext.ts       # Main setup hook
├── utils/                    # Utility functions and schemas
│   └── typesAndSchemas.ts    # Zod schemas and TypeScript types
├── intuned-resources/
│   └── jobs/
│       └── demo-hook.job.jsonc  # Job definition for demo-hook API
├── .parameters/              # Parameter files for testing APIs
│   └── api/                  # API parameters folder
│       └── demo-hook/        # Parameters for demo API
│           └── default.json  # Default parameters
└── Intuned.jsonc             # Intuned project configuration file
```

## Learn More

- [Intuned CLI](https://docs.intunedhq.com/docs/05-references/cli/overview)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
