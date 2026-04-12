# Playwright Basics (TypeScript)

A comprehensive TypeScript template covering core Playwright automation patterns. Each API demonstrates a specific concept, numbered for progressive learning.

<!-- IDE-IGNORE-START -->
## Run on Intuned

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/playwright-basics" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>
<!-- IDE-IGNORE-END -->

## APIs

| API | Description |
| ----- | ------------- |
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

<!-- IDE-IGNORE-START -->
## Getting started

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
intuned dev run api 01-basic-navigation .parameters/api/01-basic-navigation/default.json
intuned dev run api 02-wait-strategies .parameters/api/02-wait-strategies/default.json
intuned dev run api 03-locators-and-selectors .parameters/api/03-locators-and-selectors/default.json
intuned dev run api 04-scrape-single-value .parameters/api/04-scrape-single-value/default.json
intuned dev run api 05-scrape-list .parameters/api/05-scrape-list/default.json
intuned dev run api 06-click-and-navigate .parameters/api/06-click-and-navigate/default.json
intuned dev run api 07-fill-form .parameters/api/07-fill-form/default.json
intuned dev run api 08-handle-new-tabs .parameters/api/08-handle-new-tabs/default.json
intuned dev run api 09-work-with-frames .parameters/api/09-work-with-frames/default.json
intuned dev run api 10-page-evaluate .parameters/api/10-page-evaluate/default.json
intuned dev run api 11-api-requests .parameters/api/11-api-requests/default.json
intuned dev run api 12-download-file .parameters/api/12-download-file/default.json
intuned dev run api 13-upload-file .parameters/api/13-upload-file/default.json
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
├── intuned-resources/
│   └── jobs/                       # Job definitions for each API
├── .parameters/api/                # Test parameters
├── Intuned.jsonc                   # Project config
├── package.json                    # Node.js dependencies
└── README.md
```

## Related

- [Intuned CLI](https://intunedhq.com/docs/main/05-references/cli/overview)
- [Playwright deep dive](https://intunedhq.com/docs/main/01-learn/deep-dives/playwright)
- [Intuned Browser SDK](https://intunedhq.com/docs/automation-sdks/overview)
- [Intuned llm.txt](https://intunedhq.com/docs/llms.txt)
