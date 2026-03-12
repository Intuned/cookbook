# RPA Example - Consultation Booking

Booking automation example that demonstrates how to book consultations and retrieve consultation data without authentication.

<!-- IDE-IGNORE-START -->
## Run on Intuned

Open this project in Intuned by clicking the button below.

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/rpa-example" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>
<!-- IDE-IGNORE-END -->

## What This Example Does

This example demonstrates basic RPA (Robotic Process Automation) workflows:

1. **Book Consultations** - Automates filling out and submitting a consultation booking form with various topics (automation, API integration, data extraction, or other)
2. **Get Consultations** - Retrieves consultation bookings for a specific email address

<!-- IDE-IGNORE-START -->
## Getting Started

### Install Dependencies

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

### Deploy to Intuned

```bash
intuned dev deploy
```
<!-- IDE-IGNORE-END -->

## `@intuned/browser`: Intuned Browser SDK

This project uses Intuned browser SDK. For more information, check out the [Intuned Browser SDK documentation](https://docs.intunedhq.com/automation-sdks/overview).

## Project Structure

```text
/
├── api/
│   ├── book-consultations.ts              # Book a consultation
│   └── get-consultations-by-email.ts      # Get consultations for an email
├── .parameters/
│   └── api/
│       ├── book-consultations/
│       │   ├── default.json                        # Default booking (other topic)
│       │   ├── automation-consultation.json        # Automation topic
│       │   ├── api-integration-consultation.json   # API integration topic
│       │   ├── data-extraction-consultation.json   # Data extraction topic
│       │   └── other-topic-consultation.json       # Other topic
│       └── get-consultations-by-email/
│           └── default.json                        # Get consultations query
├── utils/
│   └── typesAndSchemas.ts              # Type definitions and schemas
├── intuned-resources/
│   └── jobs/
│       ├── book-consultations.job.jsonc         # Job for booking consultations
│       └── get-consultations-by-email.job.jsonc # Job for getting consultations
├── Intuned.jsonc                       # Intuned project configuration
├── package.json                        # Dependencies
└── tsconfig.json                       # TypeScript configuration
```

## Related

- **Intuned Concepts**: <https://docs.intunedhq.com/docs/00-getting-started/introduction>
- **Intuned Browser SDK**: <https://docs.intunedhq.com/automation-sdks/overview>
- **CLI Documentation**: <https://docs.intunedhq.com/docs/05-references/cli>
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
