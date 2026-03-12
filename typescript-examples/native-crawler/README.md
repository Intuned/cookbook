# Native Crawler (TypeScript)

A simple, library-free web crawler demonstrating Intuned's `extendPayload` and `persistentStore` features for parallel crawling with deduplication.

## Run on Intuned

Open this project in Intuned by clicking the button below.

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/native-crawler" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>

## Architecture

This project showcases two key Intuned runtime features:

### `extendPayload`

Dynamically spawn new payloads within a job. This enables a **fan-out pattern** where one API call triggers many others, all within the same job run.
Reference: <https://docs.intunedhq.com/docs/05-references/runtime-sdk-typescript/extend-payload>

### `persistentStore`

A shared key-value store that persists across all payloads in a job. Used here for **URL deduplication** — preventing the same page from being crawled multiple times.
Reference: <https://docs.intunedhq.com/docs/05-references/runtime-sdk-typescript/persistent-store>

## Flow

```text
                    ┌─────────────────────────────────────────────────┐
                    │                   JOB RUN                       │
                    │                                                 │
                    │    ┌─────────────────────────────────────────┐  │
                    │    │     SHARED persistentStore              │  │
                    │    │  (tracks visited URLs)                  │  │
                    │    └─────────────────────────────────────────┘  │
                    │                                                 │
  Start Job ───────►│  1. crawl(seed_url)                            │
                    │     ├─► Extract markdown content               │
                    │     ├─► Discover 50 links                      │
                    │     └─► extendPayload(crawl) × 50              │
                    │                      │                         │
                    │     ┌────────────────┼────────────────┐        │
                    │     ▼                ▼                ▼        │
                    │  2. crawl(link1)  crawl(link2)    crawl(...)   │
                    │     ├─► Extract    ├─► Extract    ├─► ...      │
                    │     ├─► Discover   ├─► Discover   │            │
                    │     └─► extend...  └─► extend...  │            │
                    │                                                 │
                    │  Continues until depth/page limits reached     │
                    │  All results sent to job sink (webhook/S3)     │
                    └─────────────────────────────────────────────────┘
```

## APIs

| API | Description |
| --- | ----------- |
| `crawl` | Crawls a URL: extracts markdown content, discovers links, and queues them via `extendPayload` for parallel recursive crawling |

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
intuned dev run api crawl .parameters/api/crawl/default.json
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
│   └── crawl.ts          # Main API: extract content + discover links + recurse
├── utils/
│   ├── index.ts
│   ├── content.ts        # extractPageContent() - markdown extraction
│   └── links.ts          # extractLinks() - link discovery + normalization
├── intuned-resources/
│   └── jobs/
│       └── crawl.job.jsonc  # Job definition for crawl API
├── .parameters/api/         # Test parameters
├── Intuned.jsonc
├── package.json
└── README.md
```

## API parameters

| Parameter | Type | Default | Description |
| ----------- | ------ | --------- | ------------- |
| `url` | string | required | URL to crawl |
| `max_depth` | number | 2 | Maximum crawl depth from seed |
| `max_pages` | number | 50 | Maximum total pages to process |
| `depth` | number | 0 | Current depth (set internally by extendPayload) |

## Usage

### As a job (production)

When run as a job, `extendPayload` spawns parallel payloads and `persistentStore` deduplicates across all of them:

```bash
curl -X POST "https://api.intunedhq.com/projects/{project}/jobs" \
  -H "Authorization: Bearer {api_key}" \
  -d '{
    "payload": {
      "api": "crawl",
      "parameters": {
        "url": "https://books.toscrape.com",
        "max_depth": 2,
        "max_pages": 100
      }
    },
    "sink": {
      "type": "webhook",
      "url": "https://your-webhook.com/results"
    }
  }'
```

### Structured data extraction (schema)

Edit `.parameters/api/crawl/default.json` to include a schema:

```json
{
  "url": "https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html",
  "max_depth": 0,
  "schema": {
    "type": "object",
    "properties": {
      "title": { "type": "string" },
      "price": { "type": "string" },
      "availability": { "type": "string" }
    },
    "required": ["title", "price"]
  }
}
```

Then run:

```bash
intuned dev run api crawl .parameters/api/crawl/default.json
```

### Download attachments

Edit `.parameters/api/crawl/default.json`:

```json
{
  "url": "https://sandbox.intuned.dev/pdfs",
  "max_depth": 1,
  "include_attachments": true
}
```

Then run:

```bash
intuned dev run api crawl .parameters/api/crawl/default.json
```

## Utils

### `utils/content.ts`

- `extractPageContent(page)` — Returns `{title, markdown, markdown_length}`

### `utils/links.ts`

- `extractLinks(page, baseDomain, includeExternal)` — Returns list of normalized URLs
- `normalizeUrl(url)` — Normalize URL (remove fragments, trailing slashes)
- `getBaseDomain(url)` — Extract domain from URL

## Deduplication keys

The `persistentStore` uses these key patterns:

| Key Pattern | Purpose |
| ------------- | --------- |
| `visited_{url}` | Tracks URLs that have been visited |
| `__page_count__` | Global counter for pages processed |
| `__base_domain__` | Stored config: base domain for filtering |

## Related

- [Intuned CLI](https://docs.intunedhq.com/docs/05-references/cli/overview)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [extendPayload Helper](https://docs.intunedhq.com/docs/05-references/runtime-sdk-typescript/extend-payload)
- [persistentStore Helper](https://docs.intunedhq.com/docs/05-references/runtime-sdk-typescript/persistent-store)
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
