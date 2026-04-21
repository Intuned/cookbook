# starter-firecrawl (Python)

Minimal Firecrawl-style starter using the open-source [crawl4ai](https://crawl4ai.com) backend on Intuned.

<!-- IDE-IGNORE-START -->
<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/starter-firecrawl" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>
<!-- IDE-IGNORE-END -->

## APIs

| API | Description |
| --- | ----------- |
| `scrape` | Scrape a single URL with crawl4ai and return the page content as markdown |

<!-- IDE-IGNORE-START -->
## Getting Started

### Install dependencies

```bash
uv sync
```

If the `intuned` CLI is not installed, install it globally:

```bash
npm install -g @intuned/cli
```

### Run an API

```bash
intuned dev run api scrape .parameters/api/scrape/default.json
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

## Project Structure

```
starter-firecrawl/
├── api/
│   └── scrape.py                          # Minimal crawl4ai-based scrape
├── intuned-resources/
│   └── jobs/
│       └── scrape.job.jsonc
├── .parameters/
│   └── api/
│       └── scrape/
│           └── default.json
├── Intuned.jsonc
├── pyproject.toml
└── README.md
```

## Related

- [Intuned CLI](https://intunedhq.com/docs/main/05-references/cli/overview)
- [crawl4ai docs](https://docs.crawl4ai.com)
- [Firecrawl API reference](https://docs.firecrawl.dev/api-reference/introduction)
- [Intuned llm.txt](https://intunedhq.com/docs/llms.txt)
