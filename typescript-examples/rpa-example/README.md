# RPA Example (TypeScript)

RPA example for booking consultations without authentication.

## Run on Intuned

Open this project in Intuned by clicking the button below.

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/rpa-example" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>

## APIs

| API | Description |
| --- | ----------- |
| `book-consultations` | Automates filling out and submitting a consultation booking form with configurable topic, date, time, and contact info |
| `get-consultations-by-email` | Retrieves all consultation bookings associated with a specific email address |

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
# Book consultations with different topics
intuned dev run api book-consultations .parameters/api/book-consultations/default.json
intuned dev run api book-consultations .parameters/api/book-consultations/automation-consultation.json
intuned dev run api book-consultations .parameters/api/book-consultations/api-integration-consultation.json
intuned dev run api book-consultations .parameters/api/book-consultations/data-extraction-consultation.json
intuned dev run api book-consultations .parameters/api/book-consultations/other-topic-consultation.json

# Get consultations by email
intuned dev run api get-consultations-by-email .parameters/api/get-consultations-by-email/default.json
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
│   ├── book-consultations.ts              # Book a consultation
│   └── get-consultations-by-email.ts      # Get consultations for an email
├── utils/
│   └── typesAndSchemas.ts                 # Type definitions and Zod schemas
├── intuned-resources/
│   └── jobs/
│       ├── book-consultations.job.jsonc         # Job for booking consultations
│       └── get-consultations-by-email.job.jsonc # Job for getting consultations
├── .parameters/api/                       # Test parameters
├── Intuned.jsonc                          # Project config
├── package.json                           # Node.js dependencies
├── tsconfig.json                          # TypeScript configuration
└── README.md
```

## Related

- [Intuned CLI](https://docs.intunedhq.com/docs/05-references/cli/overview)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
