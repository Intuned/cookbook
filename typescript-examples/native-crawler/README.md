# native-crawler

A simple, library-free web crawler demonstrating Intuned's `extendPayload` and `persistentStore` features for parallel crawling with deduplication.

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
yarn install

# Run the crawler
yarn intuned run api crawl '{"url": "https://books.toscrape.com", "max_depth": 2, "max_pages": 10}'
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