# starter-crawl4ai (Python)

Minimal [crawl4ai](https://crawl4ai.com) starter. Crawls a URL and returns markdown.

<!-- IDE-IGNORE-START -->
<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/starter-crawl4ai" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>
<!-- IDE-IGNORE-END -->

## APIs

| API | Description |
| --- | ----------- |
| `simple-crawl` | Crawl a single URL with crawl4ai and return markdown |

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
intuned dev run api simple-crawl .parameters/api/simple-crawl/default.json
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
starter-crawl4ai/
├── api/
│   └── simple-crawl.py                     # Minimal crawl4ai crawler
├── intuned-resources/
│   └── jobs/
│       └── simple-crawl.job.jsonc
├── Intuned.jsonc
├── pyproject.toml
└── README.md
```

## Related

- [crawl4ai docs](https://docs.crawl4ai.com)
- [Intuned CLI](https://intunedhq.com/docs/main/05-references/cli/overview)
- [Intuned llm.txt](https://intunedhq.com/docs/llms.txt)
