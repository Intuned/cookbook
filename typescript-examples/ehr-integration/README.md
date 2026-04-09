# EHR Integration (TypeScript)

Electronic Health Records (EHR) integration template for extracting data from OpenIMIS healthcare management system.

<!-- IDE-IGNORE-START -->
## Run on Intuned

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/ehr-integration" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>
<!-- IDE-IGNORE-END -->

## APIs

| API | Description |
| --- | ----------- |
| `claims` | Extracts claims data from the EHR system including claim status, dates, and associated patient information |
| `families` | Retrieves family/group data from the EHR system with member relationships and coverage details |
| `insurees` | Extracts insuree (patient) data including demographics, enrollment status, and insurance information |

<!-- IDE-IGNORE-START -->
## Getting started

### Install dependencies

```bash
# npm
npm install

# yarn
yarn
```

> **Note:** Install the Intuned CLI globally if you haven't already: `npm install -g @intuned/cli`

### Run an API

```bash
intuned dev run api claims .parameters/api/claims/default.json --auth-session test-authsession
intuned dev run api families .parameters/api/families/default.json --auth-session test-authsession
intuned dev run api insurees .parameters/api/insurees/default.json --auth-session test-authsession
```

### Auth Sessions

This project uses Intuned Auth Sessions. To learn more, check out the [Auth Sessions](https://intunedhq.com/docs/main/02-features/auth-sessions) documentation.

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
│   ├── claims.ts                  # Extract claims data
│   ├── families.ts                # Extract families/groups data
│   └── insurees.ts                # Extract insurees data
├── auth-sessions/                 # Auth session management
│   ├── check.ts                   # Validate auth session
│   └── create.ts                  # Create auth session
├── Intuned.jsonc                  # Intuned project configuration
└── package.json                   # Node.js project dependencies
```

## Key features

- **Authenticated Access**: Uses Intuned Auth Sessions for secure access to protected EHR data
- **Multiple Data Types**: Extract claims, families, and insurees data from the EHR system
- **Programmatic Auth**: Automated login and session management via API-based auth sessions
- **Healthcare Data Export**: Structured extraction of healthcare records for integration workflows

## Related

- [Intuned CLI](https://intunedhq.com/docs/main/05-references/cli/overview)
- [Auth Sessions](https://intunedhq.com/docs/main/02-features/auth-sessions)
- [Intuned Browser SDK](https://intunedhq.com/docs/automation-sdks/overview)
- [OpenIMIS Documentation](https://openimis.org/)
- [Intuned llm.txt](https://intunedhq.com/docs/llms.txt)
