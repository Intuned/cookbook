# RPA Example with Auth Sessions

Credentials-based booking automation to book a consultation with a consultant and list consultations using Auth Sessions.

<!-- IDE-IGNORE-START -->
## Run on Intuned

Open this project in Intuned by clicking the button below.

[![Run on Intuned](https://cdn1.intuned.io/button.svg)](https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/rpa-auth-example)

## Getting Started

To get started developing browser automation projects with Intuned, check out the 
- Intuned docs [here](https://docs.intunedhq.com/docs/00-getting-started/introduction)
- CLI docs [here](https://docs.intunedhq.com/docs/05-references/cli)
- Intuned.jsonc docs [here](https://docs.intunedhq.com/docs/05-references/intuned-json#intuned-json)


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

After installing dependencies, `intuned` command should be available in your environment.

### Run an API

```bash
# Book a consultation with default parameters
# npm
npm run intuned -- run api book-consultations .parameters/api/book-consultations/default.json --auth-session test-auth-session

# yarn
yarn intuned run api book-consultations .parameters/api/book-consultations/default.json --auth-session test-auth-session

# Book an automation consultation
# npm
npm run intuned -- run api book-consultations .parameters/api/book-consultations/automation-consultation.json --auth-session test-auth-session

# yarn
yarn intuned run api book-consultations .parameters/api/book-consultations/automation-consultation.json --auth-session test-auth-session

# Book an API integration consultation
# npm
npm run intuned -- run api book-consultations .parameters/api/book-consultations/api-integration-consultation.json --auth-session test-auth-session

# yarn
yarn intuned run api book-consultations .parameters/api/book-consultations/api-integration-consultation.json --auth-session test-auth-session

# Book a data extraction consultation
# npm
npm run intuned -- run api book-consultations .parameters/api/book-consultations/data-extraction-consultation.json --auth-session test-auth-session

# yarn
yarn intuned run api book-consultations .parameters/api/book-consultations/data-extraction-consultation.json --auth-session test-auth-session

# Book an other topic consultation
# npm
npm run intuned -- run api book-consultations .parameters/api/book-consultations/other-topic-consultation.json --auth-session test-auth-session

# yarn
yarn intuned run api book-consultations .parameters/api/book-consultations/other-topic-consultation.json --auth-session test-auth-session

# Get consultations by email
# npm
npm run intuned -- run api get-consultations-by-email .parameters/api/get-consultations-by-email/default.json --auth-session test-auth-session

# yarn
yarn intuned run api get-consultations-by-email .parameters/api/get-consultations-by-email/default.json --auth-session test-auth-session
```

### Save project

```bash
# npm
npm run intuned run save

# yarn
yarn intuned run save
```

Reference for saving project [here](https://docs.intunedhq.com/docs/02-features/local-development-cli#use-runtime-sdk-and-browser-sdk-helpers)

## Auth Sessions

This project uses Intuned Auth Sessions. To learn more, check out the [Authenticated Browser Automations: Conceptual Guide](https://docs.intunedhq.com/docs/getting-started/conceptual-guides/authenticated-browser-automations-conceptual-guide).

### Create a new auth session
```bash
# npm
npm run intuned run authsession create .parameters/auth-sessions/create/default.json

# yarn
yarn intuned run authsession create .parameters/auth-sessions/create/default.json
```

### Update an existing auth session
```bash
# npm
npm run intuned run authsession update <auth-session-id>

# yarn
yarn intuned run authsession update <auth-session-id>
```

### Validate an auth session
```bash
# npm
npm run intuned run authsession validate <auth-session-id>

# yarn
yarn intuned run authsession validate <auth-session-id>
```

### Deploy project
```bash
# npm
npm run intuned deploy

# yarn
yarn intuned deploy
```

### `@intuned/browser`: Intuned Browser SDK

This project uses Intuned browser SDK. For more information, check out the [Intuned Browser SDK documentation](https://docs.intunedhq.com/automation-sdks/intuned-sdk/overview).

<!-- IDE-IGNORE-END -->

## Project Structure

```
/
├── api/                          # API endpoints
│   ├── book-consultations.ts    # Book a consultation
│   └── get-consultations-by-email.ts  # Get consultations by email
├── auth-sessions/                # Auth session related APIs
│   ├── check.ts                  # API to check if the auth session is still valid
│   └── create.ts                 # API to create/recreate the auth session programmatically
├── auth-sessions-instances/      # Auth session instances created and used by the CLI
│   └── test-auth-session/        # Example test auth session
│       ├── auth-session.json     # Browser state (cookies, localStorage)
│       └── metadata.json         # Auth session metadata
├── .parameters/                  # Test parameters for APIs
│   ├── api/                      # API parameters folder
│   │   ├── book-consultations/
│   │   │   ├── api-integration-consultation.json
│   │   │   ├── automation-consultation.json
│   │   │   ├── data-extraction-consultation.json
│   │   │   ├── default.json
│   │   │   └── other-topic-consultation.json
│   │   └── get-consultations-by-email/
│   │       └── default.json
│   └── auth-sessions/            # Auth session parameters
│       ├── check/
│       │   └── default.json
│       └── create/
│           └── default.json
├── Intuned.jsonc                 # Intuned project configuration file
├── package.json                  # Node.js project dependencies
└── tsconfig.json                 # TypeScript configuration
```

## Learn More

- [Auth Sessions Documentation](https://docs.intunedhq.com/docs/02-features/auth-sessions)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/intuned-sdk/overview)
- [RPA with Intuned](https://docs.intunedhq.com/docs/01-learn/deep-dives/intuned-indepth)
