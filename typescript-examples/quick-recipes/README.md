# Quick Recipes

Ready-to-run Intuned API examples for common browser automation patterns. Each recipe demonstrates a specific automation task.

<!-- IDE-IGNORE-START -->
## Run on Intuned

Open this project in Intuned by clicking the button below.

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/quick-recipes" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>

## Getting Started

To get started developing browser automation projects with Intuned, check out the 
- Intuned docs [here](https://docs.intunedhq.com/docs/00-getting-started/introduction)
- CLI docs [here](https://docs.intunedhq.com/docs/05-references/cli)
- Intuned.jsonc docs [here](https://docs.intunedhq.com/docs/05-references/intuned-json#intuned-json)


## Development

> **_NOTE:_** All commands support `--help` flag to get more information about the command and its arguments and options.

### Install dependencies
```bash
# npm
npm install

# yarn
yarn
```

> **_NOTE:_** If you are using `npm`, make sure to pass `--` when using options with the `intuned` command.

After installing dependencies, `intuned` command should be available in your environment.

### Run an API

```bash
# npm
npm run intuned run api download-file .parameters/api/download-file/default.json
npm run intuned run api pagination .parameters/api/pagination/default.json
npm run intuned run api upload-to-s3 .parameters/api/upload-to-s3/default.json
npm run intuned run api capture-screenshots .parameters/api/capture-screenshots/default.json

# yarn
yarn intuned run api download-file .parameters/api/download-file/default.json
yarn intuned run api pagination .parameters/api/pagination/default.json
yarn intuned run api upload-to-s3 .parameters/api/upload-to-s3/default.json
yarn intuned run api capture-screenshots .parameters/api/capture-screenshots/default.json
```

### Save project

```bash
# npm
npm run intuned run save

# yarn
yarn intuned run save
```

Reference for saving project [here](https://docs.intunedhq.com/docs/02-features/local-development-cli#use-runtime-sdk-and-browser-sdk-helpers)

### Deploy project
```bash
# npm
npm run intuned deploy

# yarn
yarn intuned deploy
```

### `@intuned/browser`: Intuned Browser SDK

This project uses Intuned browser SDK. For more information, check out the [Intuned Browser SDK documentation](https://docs.intunedhq.com/automation-sdks/intuned-sdk/overview).

<!-- IDE-IGNORE-END -->

## Project Structure

```
/
├── api/                          # API recipes
│   ├── capture-screenshots.ts    # Capture and upload screenshots
│   ├── download-file.ts          # Download files from triggers
│   ├── pagination.ts             # Scrape paginated data
│   └── upload-to-s3.ts           # Download and upload to S3
├── .parameters/                  # Test parameters for APIs
│   └── api/                      # API parameters folder
│       ├── capture-screenshots/
│       │   └── default.json
│       ├── download-file/
│       │   └── default.json
│       ├── pagination/
│       │   └── default.json
│       └── upload-to-s3/
│           └── default.json
├── Intuned.jsonc                 # Intuned project configuration file
├── package.json                  # Node.js project dependencies
└── tsconfig.json                 # TypeScript configuration
```

## APIs

| API | Description |
|-----|-------------|
| **download-file** | Download a file triggered by a button click |
| **pagination** | Scrape data across paginated listings |
| **upload-to-s3** | Download a file and upload it to S3 in one step |
| **capture-screenshots** | Capture a screenshot and upload it to S3 |

## Learn More

- [Download File Recipe](https://docs.intunedhq.com/docs/01-learn/recipes/download-file)
- [Pagination Recipe](https://docs.intunedhq.com/docs/01-learn/recipes/pagination)
- [Upload Files Recipe](https://docs.intunedhq.com/docs/01-learn/recipes/upload-files)
- [Capture Screenshots Recipe](https://docs.intunedhq.com/docs/01-learn/recipes/capture-screenshots)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/intuned-sdk/overview)
