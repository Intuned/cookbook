# Quick Recipes (Python)

Ready-to-run Intuned API examples for common patterns. Each recipe lives in `api/`.

## APIs

| API | Description |
|-----|-------------|
| download-file | Download a file triggered by a button click |
| pagination | Scrape data across paginated listings |
| upload-to-s3 | Download a file and upload it to S3 in one step |
| capture-screenshots | Capture a screenshot and upload it to S3 |

## Project Structure

```
.
├── .parameters/              # Parameter files for each API
│   ├── download-file/
│   │   └── default.json
│   ├── pagination/
│   │   └── default.json
│   ├── upload-to-s3/
│   │   └── default.json
│   └── capture-screenshots/
│       └── default.json
├── api/                      # API implementations
│   ├── download-file.py
│   ├── pagination.py
│   ├── upload-to-s3.py
│   └── capture-screenshots.py
├── Intuned.jsonc            # Project configuration
├── pyproject.toml           # Python dependencies
└── README.md
```

## Run

```bash
# Install dependencies
uv sync

# Run an API with default parameters
uv run intuned run api download-file .parameters/download-file/default.json
uv run intuned run api pagination .parameters/pagination/default.json
uv run intuned run api upload-to-s3 .parameters/upload-to-s3/default.json
uv run intuned run api capture-screenshots .parameters/capture-screenshots/default.json

# Or run with custom parameters
uv run intuned run api pagination '{"maxPages": 3}'
```

## Envs

Set the following environment variable in your `.env` file:

```bash
INTUNED_API_KEY=your_api_key_here
```

## Learn More

- Quick recipes: https://docs.intunedhq.com/docs/01-learn/recipes/download-file
- Browser SDK: https://docs.intunedhq.com/automation-sdks/intuned-sdk/overview
