# Auth with Secret OTP (Python)

Authentication example using secret-based OTP verification.

<!-- IDE-IGNORE-START -->
## Run on Intuned

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/auth-with-secret-otp" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>
<!-- IDE-IGNORE-END -->

## APIs

| API | Description |
| --- | ----------- |
| `list-contracts` | List contracts for the authenticated user |

<!-- IDE-IGNORE-START -->
## Getting started

### Install dependencies

```bash
uv sync
```

If the `intuned` CLI is not installed, install it globally:

```bash
npm install -g @intuned/cli
```

After installing dependencies, `intuned` command should be available in your environment.

### Run an API

```bash
intuned dev run api list-contracts .parameters/api/list-contracts/default.json --auth-session test-authsession
```

### Auth Sessions

```bash
# Create
intuned dev run authsession create .parameters/auth-sessions/create/default.json

# Validate
intuned dev run authsession validate test-authsession

# Update
intuned dev run authsession update test-authsession
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
│   └── list-contracts.py             # List contracts for authenticated user
├── auth-sessions/
│   ├── check.py                      # Validates if the auth session is still active
│   └── create.py                     # Creates/recreates the auth session via OTP
├── auth-sessions-instances/
│   └── test-authsession/            # Example local auth session
│       ├── auth-session.json
│       └── metadata.json
├── utils/
│   └── types_and_schemas.py          # Type definitions and schemas
├── intuned-resources/
│   ├── jobs/
│   │   └── list-contracts.job.jsonc  # Job definition (payload, auth session)
│   └── auth-sessions/
│       └── test-authsession.auth-session.jsonc  # Auth session credentials
├── .parameters/api/                  # Test parameters
├── Intuned.jsonc                      # Project config
├── pyproject.toml                     # Python dependencies
└── README.md
```

## Related

- [Intuned CLI](https://docs.intunedhq.com/docs/05-references/cli/overview)
- [Auth Sessions](https://docs.intunedhq.com/docs/02-features/auth-sessions)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
