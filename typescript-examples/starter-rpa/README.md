# starter-rpa (TypeScript)

Minimal starter showing how to do RPA-style browser automation with Intuned: navigate to a page, wait for an element, and extract data.

<!-- IDE-IGNORE-START -->
<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/starter-rpa" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>
<!-- IDE-IGNORE-END -->

## APIs

| API | Description |
| --- | ----------- |
| `get-consultations` | Navigates to the sandbox consultations list and extracts all consultations |

<!-- IDE-IGNORE-START -->
## Getting Started

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

### Run an API

```bash
intuned dev run api get-consultations .parameters/api/get-consultations/default.json
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

## Project Structure

```
starter-rpa/
├── api/
│   └── get-consultations.ts               # Extracts consultations from the Intuned sandbox
├── intuned-resources/
│   └── jobs/
│       └── get-consultations.job.jsonc
├── .parameters/
│   └── api/
│       └── get-consultations/
│           └── default.json
├── Intuned.jsonc
├── package.json
└── README.md
```

## Related

- [Intuned CLI](https://intunedhq.com/docs/main/05-references/cli/overview)
- [Intuned Browser SDK](https://intunedhq.com/docs/automation-sdks/overview)
- [Intuned llm.txt](https://intunedhq.com/docs/llms.txt)
