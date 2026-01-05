# ehr-integration Intuned project

Electronic Health Records (EHR) integration template for extracting data from OpenIMIS healthcare management system.

## Key Features

- **Authenticated Access**: Uses Intuned Auth Sessions for secure access to protected EHR data
- **Multiple Data Types**: Extract claims, families, and insurees data from the EHR system
- **Programmatic Auth**: Automated login and session management via API-based auth sessions
- **Healthcare Data Export**: Structured extraction of healthcare records for integration workflows

<!-- IDE-IGNORE-START -->
## Run on Intuned

[![Run on Intuned](https://cdn1.intuned.io/button.svg)](https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/ehr-integration)

## Getting Started

To get started developing browser automation projects with Intuned, check out our [concepts and terminology](https://docs.intunedhq.com/docs/getting-started/conceptual-guides/core-concepts#runs%3A-executing-your-automations).


## Development

> **_NOTE:_**  All commands support `--help` flag to get more information about the command and its arguments and options.

### Install dependencies
```bash
uv sync
```

After installing dependencies, `intuned` command should be available in your environment.

### Run an API
```bash
uv run intuned run api claims .parameters/api/claims/default.json --auth-session test-auth-session
uv run intuned run api families .parameters/api/families/default.json --auth-session test-auth-session
uv run intuned run api insurees .parameters/api/insurees/default.json --auth-session test-auth-session
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
├── .parameters/                   # Test parameters for APIs
│   ├── api/
│   │   ├── claims/
│   │   │   └── default.json
│   │   ├── families/
│   │   │   └── default.json
│   │   └── insurees/
│   │       └── default.json
│   └── auth-sessions/
│       └── create/
│           └── default.json
├── api/                           # API endpoints
│   ├── claims.py                  # Extract claims data
│   ├── families.py                # Extract families/groups data
│   └── insurees.py                # Extract insurees data
├── auth-sessions/                 # Auth session management
│   ├── check.py                   # Validate auth session
│   └── create.py                  # Create auth session
├── Intuned.jsonc                  # Intuned project configuration
└── pyproject.toml                 # Python project dependencies
```


## APIs

| API | Description |
|-----|-------------|
| `claims` | Extracts claims data from the EHR system including claim status, dates, and associated patient information |
| `families` | Retrieves family/group data from the EHR system with member relationships and coverage details |
| `insurees` | Extracts insuree (patient) data including demographics, enrollment status, and insurance information |


## Learn More

- [Intuned Documentation](https://docs.intunedhq.com)
- [Auth Sessions Guide](https://docs.intunedhq.com/docs/02-features/auth-sessions)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [OpenIMIS Documentation](https://openimis.org/)
