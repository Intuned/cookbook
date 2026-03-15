# Quick Recipes (Python)

Collection of quick automation recipes for common browser tasks.

## Run on Intuned

Open this project in Intuned by clicking the button below.

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/quick-recipes" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>

## APIs

| API | Description |
| --- | ----------- |
| `download-file` | Download a file triggered by a button click |
| `pagination` | Scrape data across paginated listings |
| `upload-to-s3` | Download a file and upload it to S3 in one step |
| `capture-screenshots` | Capture a screenshot and upload it to S3 |
| `handle-load-more-button` | Scrape data by clicking a "Load More" button repeatedly |
| `infinite-scrolling` | Scrape content loaded dynamically via infinite scrolling |
| `handle-long-run` | Handle long-running scraping jobs with proper timeouts |
| `scrape-without-selectors` | Use AI-based scraping without relying on CSS selectors |

<!-- IDE-IGNORE-START -->
## Getting started

### Install dependencies

```bash
uv sync
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

### Deploy

```bash
intuned dev deploy
```
<!-- IDE-IGNORE-END -->

## Project structure

```text
/
├── api/
│   ├── capture-screenshots.py             # Capture and upload screenshots
│   ├── download-file.py                   # Download files from triggers
│   ├── pagination.py                      # Scrape paginated data
│   ├── upload-to-s3.py                    # Download and upload to S3
│   ├── handle-load-more-button.py         # Handle "Load More" button pagination
│   ├── handle-long-run.py                 # Handle long-running scraping jobs
│   ├── infinite-scrolling.py              # Scrape pages with infinite scrolling
│   └── scrape-without-selectors.py        # AI-based scraping without selectors
├── intuned-resources/
│   └── jobs/                              # Job definitions for each API
├── .parameters/api/                       # Test parameters
├── Intuned.jsonc                          # Project config
├── pyproject.toml                         # Python dependencies
└── README.md
```

## Related

- [Intuned CLI](https://docs.intunedhq.com/docs/05-references/cli/overview)
- [Download File Recipe](https://docs.intunedhq.com/docs/01-learn/recipes/download-file)
- [Pagination Recipe](https://docs.intunedhq.com/docs/01-learn/recipes/pagination)
- [Upload Files Recipe](https://docs.intunedhq.com/docs/01-learn/recipes/upload-files)
- [Capture Screenshots Recipe](https://docs.intunedhq.com/docs/01-learn/recipes/capture-screenshots)
- [Handle Infinite Scrolling Recipe](https://docs.intunedhq.com/docs/01-learn/recipes/infinite-scrolling)
- [Handle load more buttons Recipe](https://docs.intunedhq.com/docs/01-learn/recipes/load-more-button)
- [Scrape without writing selectors Recipe](https://docs.intunedhq.com/docs/01-learn/recipes/ai-scraper)
- [Handle long-running automations Recipe](https://docs.intunedhq.com/docs/01-learn/recipes/long-running-api)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
