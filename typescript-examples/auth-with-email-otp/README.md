# Auth with Email OTP (TypeScript)

Authentication automation with email-based OTP verification using Resend for email inbox access.

## Run on Intuned

Open this project in Intuned by clicking the button below.

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/auth-with-email-otp" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>

## APIs

| API | Description |
| --- | ----------- |
| `list-contracts` | List contracts for the authenticated user |

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

> **Note:** This example requires a [Resend](https://resend.com) account and API key. Set the `RESEND_API_KEY` environment variable before running.

### Run an API

```bash
intuned dev run api list-contracts .parameters/api/list-contracts/default.json --auth-session test-auth-session
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

## Project structure

```text
/
├── api/
│   └── list-contracts.ts             # List contracts for authenticated user
├── auth-sessions/
│   ├── check.ts                      # Validates if the auth session is still active
│   └── create.ts                     # Creates/recreates the auth session via email OTP
├── auth-sessions-instances/
│   └── test-auth-session/            # Example local auth session
│       ├── auth-session.json
│       └── metadata.json
├── utils/
│   ├── resend.ts                     # Resend API integration for email OTP
│   └── types-and-schemas.ts          # Type definitions and schemas
├── intuned-resources/
│   ├── jobs/
│   │   └── list-contracts.job.jsonc  # Job definition (payload, auth session)
│   └── auth-sessions/
│       └── test-auth-session.auth-session.jsonc  # Auth session credentials
├── .parameters/api/                  # Test parameters
├── Intuned.jsonc                      # Project config
├── package.json                       # Node.js dependencies
└── README.md
```

## Environment Variables

| Variable | Description |
| --- | ----------- |
| `RESEND_API_KEY` | Your Resend API key from [resend.com](https://resend.com) — required for OTP email retrieval |

## Related

- [Intuned CLI](https://docs.intunedhq.com/docs/05-references/cli/overview)
- [Auth Sessions](https://docs.intunedhq.com/docs/02-features/auth-sessions)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
