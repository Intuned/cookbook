# Playwright Basics (Python)

A comprehensive Python template covering core Playwright automation patterns. Each API demonstrates a specific concept, numbered for progressive learning.

**Documentation:** [Playwright for automation](https://docs.intunedhq.com/docs/01-learn/deep-dives/playwright)

## Run on Intuned

Open this project in Intuned by clicking the button below.

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/playwright-basics" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>

## APIs

| API | Description |
| ----- | ------------- |
| `01-basic-navigation` | Navigate to URLs, get page info |
| `02-wait-strategies` | wait_for_load_state, wait_for_selector |
| `03-locators-and-selectors` | CSS, XPath, get_by_role, chaining |
| `04-scrape-single-value` | text_content, get_attribute |
| `05-scrape-list` | Loop through elements with count/nth |
| `06-click-and-navigate` | Click elements, pagination |
| `07-fill-form` | Text inputs, dropdowns, checkboxes |
| `08-handle-new-tabs` | New pages, popups |
| `09-work-with-frames` | frame_locator, content_frame |
| `10-page-evaluate` | Execute JavaScript in browser |
| `11-api-requests` | page.request GET/POST |
| `12-download-file` | Download files with Intuned SDK |
| `13-upload-file` | Upload files to S3 |

## Getting started

### Install dependencies

```bash
uv sync
```

### Run an API

```bash
# Basic navigation
uv run intuned run api 01-basic-navigation .parameters/api/01-basic-navigation/default.json

# Wait strategies
uv run intuned run api 02-wait-strategies .parameters/api/02-wait-strategies/default.json

# Locators and selectors
uv run intuned run api 03-locators-and-selectors .parameters/api/03-locators-and-selectors/default.json

# Scrape single value
uv run intuned run api 04-scrape-single-value .parameters/api/04-scrape-single-value/default.json

# Scrape list
uv run intuned run api 05-scrape-list .parameters/api/05-scrape-list/default.json

# Click and navigate
uv run intuned run api 06-click-and-navigate .parameters/api/06-click-and-navigate/default.json

# Fill form
uv run intuned run api 07-fill-form .parameters/api/07-fill-form/default.json

# Handle new tabs
uv run intuned run api 08-handle-new-tabs .parameters/api/08-handle-new-tabs/default.json

# Work with frames
uv run intuned run api 09-work-with-frames .parameters/api/09-work-with-frames/default.json

# Page evaluate
uv run intuned run api 10-page-evaluate .parameters/api/10-page-evaluate/default.json

# API requests
uv run intuned run api 11-api-requests .parameters/api/11-api-requests/default.json

# Download file
uv run intuned run api 12-download-file .parameters/api/12-download-file/default.json

# Upload file (requires S3 credentials)
uv run intuned run api 13-upload-file .parameters/api/13-upload-file/default.json
```

### Save project

```bash
uv run intuned provision
```

### Deploy

```bash
uv run intuned deploy
```

## Project structure

```text
/
├── api/
│   ├── 01-basic-navigation.py      # Navigate to URLs
│   ├── 02-wait-strategies.py       # Wait for page load
│   ├── 03-locators-and-selectors.py # Find elements
│   ├── 04-scrape-single-value.py   # Extract single values
│   ├── 05-scrape-list.py           # Extract lists
│   ├── 06-click-and-navigate.py    # Click and pagination
│   ├── 07-fill-form.py             # Form interactions
│   ├── 08-handle-new-tabs.py       # Multi-page handling
│   ├── 09-work-with-frames.py      # iframes
│   ├── 10-page-evaluate.py         # JavaScript execution
│   ├── 11-api-requests.py          # HTTP requests
│   ├── 12-download-file.py         # File downloads
│   └── 13-upload-file.py           # S3 uploads
├── .parameters/api/                # Test parameters
├── Intuned.jsonc                   # Project config
├── pyproject.toml                  # Python dependencies
└── README.md
```

## Related

- [Playwright deep dive](https://docs.intunedhq.com/docs/01-learn/deep-dives/playwright)
- [Intuned SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
