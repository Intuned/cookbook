# RPA Example with Auth Sessions (TypeScript)

Credentials-based booking automation to book a consultation with a consultant and list consultations using Auth Sessions.

<!-- IDE-IGNORE-START -->
## Run on Intuned

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/rpa-auth-example" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>
<!-- IDE-IGNORE-END -->

## APIs

| API | Description |
| --- | ----------- |
| `book-consultations` | Book a consultation with the provided details |
| `get-consultations-by-email` | Get all consultations for a given email address |

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
intuned dev run api book-consultations .parameters/api/book-consultations/default.json --auth-session test-auth-session
intuned dev run api get-consultations-by-email .parameters/api/get-consultations-by-email/default.json --auth-session test-auth-session
```

### Auth Sessions

```bash
# Create
intuned dev run authsession create .parameters/auth-sessions/create/default.json

# Validate
intuned dev run authsession validate test-auth-session

# Update
intuned dev run authsession update test-auth-session
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
│   ├── book-consultations.ts         # Book a consultation
│   └── get-consultations-by-email.ts # Get consultations by email
├── auth-sessions/
│   ├── check.ts                      # Validates if the auth session is still active
│   └── create.ts                     # Creates/recreates the auth session
├── auth-sessions-instances/
│   └── test-auth-session/            # Example local auth session
│       ├── auth-session.json
│       └── metadata.json
├── utils/
│   └── typesAndSchemas.ts            # Type definitions and schemas
├── intuned-resources/
│   ├── jobs/
│   │   ├── book-consultations.job.jsonc          # Job definition for booking
│   │   └── get-consultations-by-email.job.jsonc  # Job definition for listing
│   └── auth-sessions/
│       └── test-auth-session.auth-session.jsonc  # Auth session credentials
├── .parameters/api/                  # Test parameters
├── Intuned.jsonc                      # Project config
├── package.json                       # Node.js dependencies
└── README.md
```

## Related

- [Intuned CLI](https://docs.intunedhq.com/docs/05-references/cli/overview)
- [Auth Sessions](https://docs.intunedhq.com/docs/02-features/auth-sessions)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
