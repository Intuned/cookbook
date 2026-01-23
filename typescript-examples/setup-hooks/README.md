# setup-hooks Intuned project

Example demonstrating how to use setup hooks in Intuned to prepare data and configuration before your API executes

## Run on Intuned

Open this project in Intuned by clicking the button below.

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/setup-hooks" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>

## Development

> **_NOTE:_** All commands support `--help` flag to get more information about the command and its arguments and options.

### Install dependencies

```bash
# npm
npm install

# yarn
yarn
```

> **_NOTE:_** If you are using `npm`, make sure to pass `--` when using options with the `intuned` command.

### Run an API

```bash
# npm
npm run intuned run api demo-hook .parameters/api/demo-hook/default.json

# yarn
yarn intuned run api demo-hook .parameters/api/demo-hook/default.json
```

### Save project

```bash
# npm
npm run intuned provision

# yarn
yarn intuned provision
```

### Deploy project

```bash
# npm
npm run intuned deploy

# yarn
yarn intuned deploy
```

### `@intuned/browser`: Intuned Browser SDK

This project uses Intuned browser SDK. For more information, check out the [Intuned Browser SDK documentation](https://docs.intunedhq.com/automation-sdks/overview).

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
├── .parameters/              # Parameter files for testing APIs
│   └── api/                  # API parameters folder
│       └── demo-hook/        # Parameters for demo API
│           └── default.json  # Default parameters
└── Intuned.jsonc             # Intuned project configuration file
```

## Learn More

- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
