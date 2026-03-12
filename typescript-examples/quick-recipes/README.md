# Quick Recipes

Ready-to-run Intuned API examples for common browser automation patterns. Each recipe demonstrates a specific automation task.

<!-- IDE-IGNORE-START -->
## Run on Intuned

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/quick-recipes" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>
<!-- IDE-IGNORE-END -->

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

After installing dependencies, `intuned` command should be available in your environment.

### Run an API

```bash
intuned dev run api download-file .parameters/api/download-file/default.json
intuned dev run api pagination .parameters/api/pagination/default.json
intuned dev run api upload-to-s3 .parameters/api/upload-to-s3/default.json
intuned dev run api capture-screenshots .parameters/api/capture-screenshots/default.json
intuned dev run api handle-load-more-button .parameters/api/handle-load-more-button/default.json
intuned dev run api infinite-scrolling .parameters/api/infinite-scrolling/default.json
intuned dev run api handle-long-run .parameters/api/handle-long-run/default.json
intuned dev run api scrape-without-selectors .parameters/api/scrape-without-selectors/default.json
```

### Save project

```bash
intuned dev provision
```

### Deploy project

```bash
intuned dev deploy
```

<!-- IDE-IGNORE-END -->

## Project Structure

```text
/
├── api/                                   # API recipes 
│   ├── capture-screenshots.ts             # Capture and upload screenshots
│   ├── download-file.ts                   # Download files from triggers
│   ├── pagination.ts                      # Scrape paginated data
│   ├── upload-to-s3.ts                    # Download and upload to S3
│   ├── handle-load-more-button.ts         # Repeatedly click "Load More" buttons to scrape data
│   ├── infinite-scrolling.ts              # Scrape content loaded via infinite scrolling
│   ├── handle-long-run.ts                 # Handle long-running scraping jobs using timeouts
│   └── scrape-without-selectors.ts        # AI-based scraping without CSS selectors
│
├── .parameters/                           # Test parameters for APIs
│   └── api/                               # API parameters folder
│       ├── capture-screenshots/
│       │   └── default.json               
│       ├── download-file/
│       │   └── default.json              
│       ├── pagination/
│       │   └── default.json              
│       ├── upload-to-s3/
│       │   └── default.json              
│       ├── handle-load-more-button/
│       │   └── default.json              
│       ├── infinite-scrolling/
│       │   └── default.json               
│       ├── handle-long-run/
│       │   └── default.json               
│       └── scrape-without-selectors/
│           └── default.json              
│
├── intuned-resources/
│   └── jobs/                              # Job definitions for each API
├── Intuned.jsonc                          # Intuned project configuration
├── package.json                           # Node.js dependencies and scripts
└── tsconfig.json                          # TypeScript compiler configuration
```

## APIs

| API | Description |
| ----- | ------------- |
| **download-file** | Download a file triggered by a button click |
| **pagination** | Scrape data across paginated listings |
| **upload-to-s3** | Download a file and upload it to S3 in one step |
| **capture-screenshots** | Capture a screenshot and upload it to S3 |

## Related

- [Download File Recipe](https://docs.intunedhq.com/docs/01-learn/recipes/download-file)
- [Pagination Recipe](https://docs.intunedhq.com/docs/01-learn/recipes/pagination)
- [Upload Files Recipe](https://docs.intunedhq.com/docs/01-learn/recipes/upload-files)
- [Capture Screenshots Recipe](https://docs.intunedhq.com/docs/01-learn/recipes/capture-screenshots)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [Handle Infinite Scrolling Recipe](https://docs.intunedhq.com/docs/01-learn/recipes/infinite-scrolling)
- [Handle load more buttons Recipe](https://docs.intunedhq.com/docs/01-learn/recipes/load-more-button)
- [Scrape without writing selectors Recipe](https://docs.intunedhq.com/docs/01-learn/recipes/ai-scraper)
- [Handle long-running automations with timeouts Recipe](https://docs.intunedhq.com/docs/01-learn/recipes/long-running-api)
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
