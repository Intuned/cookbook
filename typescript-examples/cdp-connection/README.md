# CDP Connection (TypeScript)

Basic example demonstrating how to connect to a browser using Chrome DevTools Protocol (CDP) with Intuned.

## Run on Intuned

Open this project in Intuned by clicking the button below.

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/cdp-connection" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>

## APIs

| API              | Description                                                       |
| ---------------- | ----------------------------------------------------------------- |
| `connect-to-cdp` | Connect to browser via CDP, fetch browser info, navigate to a URL |

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
intuned dev run api connect-to-cdp .parameters/api/connect-to-cdp/default.json
```

### Save project

```bash
intuned dev provision
```

### Deploy

```bash
intuned dev deploy
```

## Project structure

```text
/
├── api/
│   └── connect-to-cdp.ts         # CDP connection example
├── hooks/
│   └── setupContext.ts           # Captures CDP URL from Intuned runtime
├── utils/
│   └── typesAndSchemas.ts        # Zod schemas and TypeScript types
├── intuned-resources/
│   └── jobs/
│       └── connect-cdp.job.jsonc # Job definition (schedule, payload)
├── .parameters/api/              # Test parameters
├── Intuned.jsonc                  # Project config
├── package.json                   # Node.js dependencies
└── README.md
```

## Related

- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
