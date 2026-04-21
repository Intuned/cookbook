# starter-jsdom (TypeScript)

Minimal starter showing how to parse page HTML with [JSDOM](https://github.com/jsdom/jsdom) to extract structured data.

<!-- IDE-IGNORE-START -->
<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/starter-jsdom" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>
<!-- IDE-IGNORE-END -->

## APIs

| API | Description |
| --- | ----------- |
| `scrape-products` | Navigates to a product listing page and parses its HTML with JSDOM |

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
intuned dev run api scrape-products .parameters/api/scrape-products/default.json
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
starter-jsdom/
├── api/
│   └── scrape-products.ts                 # Scrapes products using JSDOM
├── intuned-resources/
│   └── jobs/
│       └── scrape-products.job.jsonc
├── .parameters/
│   └── api/
│       └── scrape-products/
│           └── default.json
├── Intuned.jsonc
├── package.json
└── README.md
```

## Related

- [Intuned CLI](https://intunedhq.com/docs/main/05-references/cli/overview)
- [Intuned Browser SDK](https://intunedhq.com/docs/automation-sdks/overview)
- [Intuned llm.txt](https://intunedhq.com/docs/llms.txt)
