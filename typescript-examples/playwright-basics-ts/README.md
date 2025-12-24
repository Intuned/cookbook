# Playwright Basics (TypeScript)

A comprehensive TypeScript template covering core Playwright automation patterns. Each API demonstrates a specific concept, numbered for progressive learning.

**Documentation:** [Playwright for automation](https://docs.intunedhq.com/docs/01-learn/deep-dives/playwright)

## Run on Intuned

Open this project in Intuned by clicking the button below.

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/playwright-basics-ts" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>

## APIs

| API | Description |
|-----|-------------|
| `01-basic-navigation` | Navigate to URLs, get page info |
| `02-wait-strategies` | waitForLoadState, waitForSelector |
| `03-locators-and-selectors` | CSS, XPath, getByRole, chaining |
| `04-scrape-single-value` | textContent, getAttribute |
| `05-scrape-list` | Loop through elements with count/nth |
| `06-click-and-navigate` | Click elements, pagination |
| `07-fill-form` | Text inputs, dropdowns, checkboxes |
| `08-handle-new-tabs` | New pages, popups |
| `09-work-with-frames` | frameLocator, contentFrame |
| `10-page-evaluate` | Execute JavaScript in browser |
| `11-api-requests` | page.request GET/POST |
| `12-download-file` | Download files with Intuned SDK |
| `13-upload-file` | Upload files to S3 |

## Getting started

### Install dependencies

```bash
npm install
# or
yarn
```

### Run an API

```bash
# Basic navigation
yarn intuned run api 01-basic-navigation .parameters/api/01-basic-navigation/default.json

# Wait strategies
yarn intuned run api 02-wait-strategies .parameters/api/02-wait-strategies/default.json

# Locators and selectors
yarn intuned run api 03-locators-and-selectors .parameters/api/03-locators-and-selectors/default.json

# Scrape single value
yarn intuned run api 04-scrape-single-value .parameters/api/04-scrape-single-value/default.json

# Scrape list
yarn intuned run api 05-scrape-list .parameters/api/05-scrape-list/default.json

# Click and navigate
yarn intuned run api 06-click-and-navigate .parameters/api/06-click-and-navigate/default.json

# Fill form
yarn intuned run api 07-fill-form .parameters/api/07-fill-form/default.json

# Handle new tabs
yarn intuned run api 08-handle-new-tabs .parameters/api/08-handle-new-tabs/default.json

# Work with frames
yarn intuned run api 09-work-with-frames .parameters/api/09-work-with-frames/default.json

# Page evaluate
yarn intuned run api 10-page-evaluate .parameters/api/10-page-evaluate/default.json

# API requests
yarn intuned run api 11-api-requests .parameters/api/11-api-requests/default.json

# Download file
yarn intuned run api 12-download-file .parameters/api/12-download-file/default.json

# Upload file (requires S3 credentials)
yarn intuned run api 13-upload-file .parameters/api/13-upload-file/default.json
```

### Deploy

```bash
yarn intuned deploy
```

## Project structure

```
/
├── api/
│   ├── 01-basic-navigation.ts      # Navigate to URLs
│   ├── 02-wait-strategies.ts       # Wait for page load
│   ├── 03-locators-and-selectors.ts # Find elements
│   ├── 04-scrape-single-value.ts   # Extract single values
│   ├── 05-scrape-list.ts           # Extract lists
│   ├── 06-click-and-navigate.ts    # Click and pagination
│   ├── 07-fill-form.ts             # Form interactions
│   ├── 08-handle-new-tabs.ts       # Multi-page handling
│   ├── 09-work-with-frames.ts      # iframes
│   ├── 10-page-evaluate.ts         # JavaScript execution
│   ├── 11-api-requests.ts          # HTTP requests
│   ├── 12-download-file.ts         # File downloads
│   └── 13-upload-file.ts           # S3 uploads
├── .parameters/api/                # Test parameters
├── Intuned.jsonc                   # Project config
└── package.json
```

## Related

- [Playwright deep dive](https://docs.intunedhq.com/docs/01-learn/deep-dives/playwright)
- [Intuned SDK](https://docs.intunedhq.com/automation-sdks/intuned-sdk/overview)
