# native-crawler

A simple, library-free web crawler demonstrating Intuned's `extend_payload` and `persistent_store` features for parallel crawling with deduplication.

## Architecture

This project showcases two key Intuned runtime features:

### `extend_payload`
Dynamically spawn new payloads within a job. This enables a **fan-out pattern** where one API call triggers many others, all within the same job run.
Reference: https://docs.intunedhq.com/docs/05-references/runtime-sdk-python/extend-payload

### `persistent_store`
A shared key-value store that persists across all payloads in a job. Used here for **URL deduplication** — preventing the same page from being crawled multiple times.
Reference: https://docs.intunedhq.com/docs/05-references/runtime-sdk-python/persistent-store

## Flow

```
                    ┌─────────────────────────────────────────────────┐
                    │                   JOB RUN                       │
                    │                                                 │
                    │    ┌─────────────────────────────────────────┐  │
                    │    │     SHARED persistent_store             │  │
                    │    │  (tracks visited URLs)                  │  │
                    │    └─────────────────────────────────────────┘  │
                    │                                                 │
  Start Job ───────►│  1. crawl(seed_url)                            │
                    │     ├─► Extract markdown content               │
                    │     ├─► Discover 50 links                      │
                    │     └─► extend_payload(crawl) × 50             │
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
│   └── crawl.py          # Main API: extract content + discover links + recurse
├── utils/
│   ├── __init__.py
│   ├── content.py        # extract_page_content() - markdown extraction
│   └── links.py          # extract_links() - link discovery + normalization
├── Intuned.jsonc
└── README.md
```

## API

### `crawl`

Crawls a URL: extracts content, discovers links, and queues them for further crawling.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `url` | string | required | URL to crawl |
| `max_depth` | int | 2 | Maximum crawl depth from seed |
| `max_pages` | int | 50 | Maximum total pages to process |
| `depth` | int | 0 | Current depth (set internally by extend_payload) |

## Usage

### Local Development

```bash
# Install dependencies
uv sync

# Run the crawler
uv run intuned run api crawl .parameters/api/crawl/default.json
```

### As a Job (Production)

When run as a job, `extend_payload` spawns parallel payloads and `attempt_store` deduplicates across all of them:

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
uv run intuned run api crawl .parameters/api/crawl/default.json
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
uv run intuned run api crawl .parameters/api/crawl/default.json
```

## Utils

### `utils/content.py`
- `extract_page_content(page)` — Returns `{title, markdown, markdown_length}`

### `utils/links.py`
- `extract_links(page, base_domain)` — Returns list of normalized internal URLs
- `normalize_url(url)` — Normalize URL (remove fragments, trailing slashes)
- `get_base_domain(url)` — Extract domain from URL

## Deduplication Keys

The `persistent_store` uses these key patterns:

| Key Pattern | Purpose |
|-------------|---------|
| `visited:{url}` | Tracks URLs that have been crawled |
| `__page_count__` | Global counter for pages processed |
| `__max_depth__` | Stored config: max depth |
| `__max_pages__` | Stored config: max pages |
| `__base_domain__` | Stored config: base domain for filtering |

## Learn More

- [Intuned Jobs Documentation](https://docs.intunedhq.com/docs-old/platform/consume/jobs)
- [Nested Scheduling / extend_payload](https://docs.intunedhq.com/docs-old/platform/consume/nested-scheduling)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)