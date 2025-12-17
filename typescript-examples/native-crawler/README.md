# Native Crawler

A simple, library-free web crawler demonstrating Intuned's `extendPayload` and `persistentStore` features for parallel crawling with deduplication.

## Overview

This project showcases how to build a production-ready web crawler using Intuned's runtime features. It crawls websites efficiently by distributing work across multiple browser sessions, preventing duplicate requests, and extracting content in various formats.

## Getting Started

To get started developing browser automation projects with Intuned, check out our [concepts and terminology](https://docs.intunedhq.com/docs/getting-started/conceptual-guides/core-concepts).

## Key Features

This project demonstrates two powerful Intuned runtime features:

### `extendPayload`
Dynamically spawn new payloads within a job. This enables a **fan-out pattern** where one API call triggers many others, all within the same job run.
- Reference: https://docs.intunedhq.com/docs/05-references/runtime-sdk-typescript/extend-payload

### `persistentStore`
A shared key-value store that persists across all payloads in a job. Used here for **URL deduplication** — preventing the same page from being crawled multiple times.
- Reference: https://docs.intunedhq.com/docs/05-references/runtime-sdk-typescript/persistent-store

## Flow

```
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

## Project Structure

```
native-crawler/
├── api/
│   └── crawl.ts          # Main API: extract content + discover links + recurse
├── utils/
│   ├── index.ts
│   ├── content.ts        # extractPageContent() - markdown extraction
│   └── links.ts          # extractLinks() - link discovery + normalization
├── .parameters/
│   └── crawl/            # Parameter presets for the crawl API
│       ├── default.json
│       ├── schema.json
│       └── attachments.json
├── Intuned.jsonc
├── .env.example
└── README.md
```

## API

### `crawl`

Crawls a URL: extracts content, discovers links, and queues them for further crawling.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `url` | string | required | URL to crawl |
| `max_depth` | number | 2 | Maximum crawl depth from seed |
| `max_pages` | number | 50 | Maximum total pages to process |
| `depth` | number | 0 | Current depth (set internally by extendPayload) |

## Development

> **Note:** All commands support `--help` flag to get more information about the command and its arguments and options.

### Install dependencies

```bash
# npm
npm install

# yarn
yarn
```

> **Note:** If you are using `npm`, make sure to pass `--` when using options with the `intuned` command.

### Run the crawler API

**Basic crawl:**

```bash
# npm
npm run intuned run api crawl '{"url": "https://books.toscrape.com", "max_depth": 2, "max_pages": 10}'

# yarn
yarn intuned run api crawl '{"url": "https://books.toscrape.com", "max_depth": 2, "max_pages": 10}'
```

**Using parameter files:**

```bash
# Run with default parameters
yarn intuned run api crawl --parameters-file .parameters/crawl/default.json

# Run with schema extraction
yarn intuned run api crawl --parameters-file .parameters/crawl/schema.json

# Run with attachments download
yarn intuned run api crawl --parameters-file .parameters/crawl/attachments.json
```

### Deploy project

```bash
# npm
npm run intuned deploy

# yarn
yarn intuned deploy
```

### `@intuned/browser`: Intuned Browser SDK

This project uses Intuned browser SDK. For more information, check out the [Intuned Browser SDK documentation](https://docs.intunedhq.com/automation-sdks/overview).

## Production Usage

### Run as a Job

When run as a job, `extendPayload` spawns parallel payloads and `persistentStore` deduplicates across all of them:

```bash
curl -X POST "https://api.intunedhq.com/projects/{project}/jobs" \
  -H "Authorization: Bearer {api_key}" \
  -H "Content-Type: application/json" \
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

### Advanced Use Cases

**Structured Data Extraction:**

Extract structured data instead of markdown by providing a JSON schema. This uses Intuned's AI extraction model.

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

**Download Attachments:**

Automatically find and download files (PDFs, images, etc.) to S3:

```json
{
  "url": "https://sandbox.intuned.dev/pdfs",
  "max_depth": 1,
  "include_external": true,
  "include_attachments": true
}
```

## Envs

**Optional:** This project uses the Intuned API key for deployment.

Create a `.env` file in the project root (don't commit to version control):

```bash
# Required for deployment
INTUNED_API_KEY=your_api_key_here
```

You can get your API key from the [Intuned Dashboard](https://app.intunedhq.com).

## Utils

### `utils/content.ts`
- `extractPageContent(page)` — Returns `{title, markdown, markdown_length}`

### `utils/links.ts`
- `extractLinks(page, baseDomain, includeExternal)` — Returns list of normalized URLs
- `normalizeUrl(url)` — Normalize URL (remove fragments, trailing slashes)
- `getBaseDomain(url)` — Extract domain from URL

## Deduplication Keys

The `persistentStore` uses these key patterns:

| Key Pattern | Purpose |
|-------------|---------|
| `visited_{url}` | Tracks URLs that have been visited |
| `__page_count__` | Global counter for pages processed |
| `__base_domain__` | Stored config: base domain for filtering |

## Resources

- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [extendPayload Documentation](https://docs.intunedhq.com/docs/05-references/runtime-sdk-typescript/extend-payload)
- [persistentStore Documentation](https://docs.intunedhq.com/docs/05-references/runtime-sdk-typescript/persistent-store)
- [Intuned Jobs Documentation](https://docs.intunedhq.com/docs-old/platform/consume/jobs)
- [Playwright TypeScript Documentation](https://playwright.dev/docs/intro)