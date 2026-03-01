# Auth with Secret OTP

Authentication automation with multi-step OTP verification using a secret key.

<!-- IDE-IGNORE-START -->
## Run on Intuned

Open this project in Intuned by clicking the button below.

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/auth-with-secret-otp" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>

## Getting Started

To get started developing browser automation projects with Intuned, check out the

- Intuned docs [here](https://docs.intunedhq.com/docs/00-getting-started/introduction)
- CLI docs [here](https://docs.intunedhq.com/docs/05-references/cli)
- Intuned.jsonc docs [here](https://docs.intunedhq.com/docs/05-references/intuned-json#intuned-json)

## Development

> **_NOTE:_** All commands support `--help` flag to get more information about the command and its arguments and options.

### Install dependencies

```bash
uv sync
```

After installing dependencies, `intuned` command should be available in your environment.

### Run an API

```bash
uv run intuned run api list-contracts .parameters/api/list-contracts/default.json --auth-session test-auth-session
```

### Save project

```bash
uv run intuned provision
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

```text
/
├── api/                          # API endpoints
│   └── list-contracts.py         # List all contracts
├── auth-sessions/                # Auth session related APIs
│   ├── check.py                  # API to check if the auth session is still valid
│   └── create.py                 # API to create/recreate the auth session programmatically
├── auth-sessions-instances/      # Auth session instances created and used by the CLI
│   └── test-auth-session/        # Example test auth session
│       ├── auth-session.json     # Browser state (cookies, localStorage)
│       └── metadata.json         # Auth session metadata
├── .parameters/                  # Test parameters for APIs
│   ├── api/                      # API parameters folder
│   │   └── list-contracts/
│   │       └── default.json
│   └── auth-sessions/            # Auth session parameters
│       ├── check/
│       │   └── default.json
│       └── create/
│           └── default.json
├── utils/                        # Utility modules
│   └── types_and_schemas.py     # Type definitions and schemas
├── Intuned.jsonc                 # Intuned project configuration file
└── pyproject.toml                # Python project dependencies
```

## Learn More

- [Auth Sessions Documentation](https://docs.intunedhq.com/docs/02-features/auth-sessions)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [OTP Authentication Guide](https://docs.intunedhq.com/docs/01-learn/deep-dives/intuned-indepth)
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
