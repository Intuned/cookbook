# Auth with Email OTP

Authentication automation with email-based OTP verification using Resend for email inbox access.

<!-- IDE-IGNORE-START -->
## Run on Intuned

[![Run on Intuned](https://cdn1.intuned.io/button.svg)](https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/auth-with-email-otp)

## Getting Started

To get started developing browser automation projects with Intuned, check out the 
- Intuned docs [here](https://docs.intunedhq.com/docs/00-getting-started/introduction)
- CLI docs [here](https://docs.intunedhq.com/docs/05-references/cli)
- Intuned.jsonc docs [here](https://docs.intunedhq.com/docs/05-references/intuned-json#intuned-json)


## Development

> **_NOTE:_** All commands support `--help` flag to get more information about the command and its arguments and options.

### Prerequisites

**Important:** This example uses [Resend](https://resend.com) for email-based OTP verification. You'll need:

1. **Resend Account** - Sign up at [resend.com](https://resend.com) to get an API key
2. **Resend API Key** - Generate an API key from your Resend dashboard
3. **Set Environment Variable**:
   ```bash
   export RESEND_API_KEY=your-resend-api-key
   ```

### Install dependencies

```bash
uv sync
```

After installing dependencies, `intuned` command should be available in your environment.

### Run an API

```bash
# List contracts with an auth session
uv run intuned run api list-contracts .parameters/api/list-contracts/default.json --auth-session test-auth-session
```

### Save project

```bash
uv run intuned save
```

Reference for saving project [here](https://docs.intunedhq.com/docs/02-features/local-development-cli#use-runtime-sdk-and-browser-sdk-helpers)

## Auth Sessions

This project uses Intuned Auth Sessions. To learn more, check out the [AuthSessions](https://docs.intunedhq.com/docs/02-features/auth-sessions).

### Create a new auth session

```bash
uv run intuned run authsession create .parameters/auth-sessions/create/default.json
```

### Update an existing auth session

```bash
uv run intuned run authsession update test-auth-session
```

### Validate an auth session

```bash
uv run intuned run authsession validate test-auth-session
```

### Deploy project

```bash
uv run intuned deploy
```

### `intuned-browser`: Intuned Browser SDK

This project uses Intuned browser SDK. For more information, check out the [Intuned Browser SDK documentation](https://docs.intunedhq.com/automation-sdks/overview).

<!-- IDE-IGNORE-END -->

## Project Structure

```
/
├── api/                          # API endpoints
│   └── list-contracts.py         # List contracts for authenticated user
├── auth-sessions/                # Auth session related APIs
│   ├── check.py                  # API to check if the auth session is still valid
│   └── create.py                 # API to create/recreate the auth session programmatically
├── auth-sessions-instances/      # Auth session instances created and used by the CLI
│   └── test-auth-session/        # Example test auth session
│       ├── auth-session.json     # Browser state (cookies, localStorage)
│       └── metadata.json         # Auth session metadata
├── utils/                        # Utility modules
│   ├── resend.py                 # Resend API integration for email OTP
│   └── types_and_schemas.py      # Type definitions and schemas
├── .parameters/                  # Test parameters for APIs
│   ├── api/                      # API parameters folder
│   │   └── list-contracts/
│   │       └── default.json
│   └── auth-sessions/            # Auth session parameters
│       ├── check/
│       │   └── default.json
│       └── create/
│           └── default.json
├── Intuned.jsonc                 # Intuned project configuration file
└── pyproject.toml                # Python project dependencies
```

## Environment Variables

This project requires the following environment variables:

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | Your Resend API key from [resend.com](https://resend.com) - Required for OTP email retrieval |

## Learn More

- [Auth Sessions Documentation](https://docs.intunedhq.com/docs/02-features/auth-sessions)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [Intuned In-Depth](https://docs.intunedhq.com/docs/01-learn/deep-dives/intuned-indepth)
