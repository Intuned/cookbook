# ehr-integration-ts Intuned project

Electronic Health Records (EHR) integration template for extracting data from OpenIMIS healthcare management system.

## Key Features

- **Authenticated Access**: Uses Intuned Auth Sessions for secure access to protected EHR data
- **Multiple Data Types**: Extract claims, families, and insurees data from the EHR system
- **Programmatic Auth**: Automated login and session management via API-based auth sessions
- **Healthcare Data Export**: Structured extraction of healthcare records for integration workflows

<!-- IDE-IGNORE-START -->
## Run on Intuned

[![Run on Intuned](https://cdn1.intuned.io/button.svg)](https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/ehr-integration-ts)

## Getting Started

To get started developing browser automation projects with Intuned, check out our [concepts and terminology](https://docs.intunedhq.com/docs/getting-started/conceptual-guides/core-concepts#runs%3A-executing-your-automations).


## Development

> **_NOTE:_**  All commands support `--help` flag to get more information about the command and its arguments and options.

### Install dependencies
```bash
# npm
npm install

# yarn
yarn
```

> **_NOTE:_**  If you are using `npm`, make sure to pass `--` when using options with the `intuned` command.


### Run an API
```bash
# npm
npm run intuned run api claims .parameters/api/claims/default.json --auth-session test-auth-session
npm run intuned run api families .parameters/api/families/default.json --auth-session test-auth-session
npm run intuned run api insurees .parameters/api/insurees/default.json --auth-session test-auth-session

# yarn
yarn intuned run api claims .parameters/api/claims/default.json --auth-session test-auth-session
yarn intuned run api families .parameters/api/families/default.json --auth-session test-auth-session
yarn intuned run api insurees .parameters/api/insurees/default.json --auth-session test-auth-session
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

This project uses Intuned Auth Sessions. To learn more, check out the [AuthSessions](https://docs.intunedhq.com/docs/02-features/auth-sessions).

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
npm run intuned run authsession update test-auth-session

# yarn
yarn intuned run authsession update test-auth-session
```

### Validate an auth session
```bash
# npm
npm run intuned run authsession validate test-auth-session

# yarn
yarn intuned run authsession validate test-auth-session
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
│   ├── claims.ts                  # Extract claims data
│   ├── families.ts                # Extract families/groups data
│   └── insurees.ts                # Extract insurees data
├── auth-sessions/                 # Auth session management
│   ├── check.ts                   # Validate auth session
│   └── create.ts                  # Create auth session
├── Intuned.jsonc                  # Intuned project configuration
└── package.json                   # Node.js project dependencies
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
