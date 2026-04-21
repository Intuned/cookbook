# starter-stagehand (TypeScript)

Minimal starter showing how to drive a browser with [Stagehand](https://github.com/browserbase/stagehand) on Intuned, using the Intuned AI gateway for LLM calls.

<!-- IDE-IGNORE-START -->
<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/starter-stagehand" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>
<!-- IDE-IGNORE-END -->

## APIs

| API | Description |
| --- | ----------- |
| `get-books` | Navigates to books.toscrape.com, optionally clicks a category, and uses `stagehand.extract` to pull book titles + prices |

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
intuned dev run api get-books .parameters/api/get-books/default.json
```

> Note: Running locally requires the Intuned AI gateway to be available. For a fully-working run, deploy to an Intuned workspace.

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
starter-stagehand/
├── api/
│   └── get-books.ts                       # Uses Stagehand to extract books from a page
├── intuned-resources/
│   └── jobs/
│       └── get-books.job.jsonc
├── .parameters/
│   └── api/
│       └── get-books/
│           └── default.json
├── Intuned.jsonc
├── package.json
└── README.md
```

## Related

- [Intuned CLI](https://intunedhq.com/docs/main/05-references/cli/overview)
- [Intuned Browser SDK](https://intunedhq.com/docs/automation-sdks/overview)
- [Stagehand](https://github.com/browserbase/stagehand)
