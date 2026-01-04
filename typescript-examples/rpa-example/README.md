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

To get started developing browser automation projects with Intuned, check out our [concepts and terminology](https://docs.intunedhq.com/docs/getting-started/conceptual-guides/core-concepts#runs%3A-executing-your-automations).

## Development

> **_NOTE:_**  All commands support `--help` flag to get more information about the command and its arguments and options.

### Install Dependencies

```bash
# npm
npm install

# yarn
yarn
```

> **_NOTE:_**  If you are using `npm`, make sure to pass `--` when using options with the `intuned` command.

### Run an API

```bash
# Book consultations with different topics
# npm
npm run intuned run api book-consultations .parameters/api/book-consultations/default.json
npm run intuned run api book-consultations .parameters/api/book-consultations/automation-consultation.json
npm run intuned run api book-consultations .parameters/api/book-consultations/api-integration-consultation.json
npm run intuned run api book-consultations .parameters/api/book-consultations/data-extraction-consultation.json
npm run intuned run api book-consultations .parameters/api/book-consultations/other-topic-consultation.json

# yarn
yarn intuned run api book-consultations .parameters/api/book-consultations/default.json
yarn intuned run api book-consultations .parameters/api/book-consultations/automation-consultation.json
yarn intuned run api book-consultations .parameters/api/book-consultations/api-integration-consultation.json
yarn intuned run api book-consultations .parameters/api/book-consultations/data-extraction-consultation.json
yarn intuned run api book-consultations .parameters/api/book-consultations/other-topic-consultation.json

# Get consultations by email
# npm
npm run intuned run api get-consultations-by-email .parameters/api/get-consultations-by-email/default.json

# yarn
yarn intuned run api get-consultations-by-email .parameters/api/get-consultations-by-email/default.json
```

### Deploy to Intuned

```bash
# npm
npm run intuned deploy

# yarn
yarn intuned deploy
```
<!-- IDE-IGNORE-END -->


## `@intuned/browser`: Intuned Browser SDK

This project uses Intuned browser SDK. For more information, check out the [Intuned Browser SDK documentation](https://docs.intunedhq.com/automation-sdks/overview).

## Project Structure

```
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
├── Intuned.jsonc                       # Intuned project configuration
├── package.json                        # Dependencies
└── tsconfig.json                       # TypeScript configuration
```

## Learn More

- **Intuned Concepts**: https://docs.intunedhq.com/docs/00-getting-started/introduction
- **Intuned Browser SDK**: https://docs.intunedhq.com/automation-sdks/overview
- **CLI Documentation**: https://docs.intunedhq.com/docs/05-references/cli
