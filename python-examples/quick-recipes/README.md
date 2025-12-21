# Quick Recipes (Python)

Ready-to-run Intuned API examples for common patterns. Each recipe lives in `api/`.

## APIs

| API | Description |
|-----|-------------|
| download-file | Download a file triggered by a button click |
| pagination | Scrape data across paginated listings |
| upload-to-s3 | Download a file and upload it to S3 in one step |
| capture-screenshots | Capture a screenshot and upload it to S3 |

## Run

```bash
uv sync
uv run intuned run api download-file .parameters/api/download-file/default.json
uv run intuned run api pagination .parameters/api/pagination/default.json
uv run intuned run api upload-to-s3 .parameters/api/upload-to-s3/default.json
uv run intuned run api capture-screenshots .parameters/api/capture-screenshots/default.json
```

## Learn More

- Quick recipes: https://docs.intunedhq.com/docs/01-learn/recipes/download-file
- Browser SDK: https://docs.intunedhq.com/automation-sdks/intuned-sdk/overview
