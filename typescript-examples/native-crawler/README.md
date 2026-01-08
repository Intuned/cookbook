# native-crawler

A simple, library-free web crawler demonstrating Intuned's `extendPayload` and `persistentStore` features for parallel crawling with deduplication.

## Run on Intuned

Open this project in Intuned by clicking the button below.

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/native-crawler" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>

## Architecture

This project showcases two key Intuned runtime features:

### `extendPayload`
Dynamically spawn new payloads within a job. This enables a **fan-out pattern** where one API call triggers many others, all within the same job run.
Reference: https://docs.intunedhq.com/docs/05-references/runtime-sdk-typescript/extend-payload

### `persistentStore`
A shared key-value store that persists across all payloads in a job. Used here for **URL deduplication** — preventing the same page from being crawled multiple times.
Reference: https://docs.intunedhq.com/docs/05-references/runtime-sdk-typescript/persistent-store

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
├── Intuned.jsonc
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

## Usage

### Local Development

```bash
# Install dependencies
# npm
npm install

# yarn
yarn install

# Run the crawler
# npm
npm run intuned run api crawl .parameters/api/crawl/default.json

# yarn
yarn intuned run api crawl .parameters/api/crawl/default.json
```

### As a Job (Production)

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

### Structured Data Extraction (Schema)

You can extract structured data instead of markdown by providing a generic JSON schema. This uses Intuned's AI extraction model.

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
# npm
npm run intuned run api crawl .parameters/api/crawl/default.json

# yarn
yarn intuned run api crawl .parameters/api/crawl/default.json
```

### Download Attachments

You can automatically find and download files (PDFs, images, etc.) to S3 by enabling `include_attachments`.

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
# npm
npm run intuned run api crawl .parameters/api/crawl/default.json

# yarn
yarn intuned run api crawl .parameters/api/crawl/default.json
```

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

## Learn More

- [Intuned Jobs Documentation](https://docs.intunedhq.com/docs-old/platform/consume/jobs)
- [Nested Scheduling / extendPayload](https://docs.intunedhq.com/docs-old/platform/consume/nested-scheduling)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
