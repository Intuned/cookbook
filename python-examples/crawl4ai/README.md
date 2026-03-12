# crawl4ai

Quick-start examples for using [crawl4ai](https://crawl4ai.com) on the Intuned platform.

This project serves as a reference for the [crawl4ai documentation](https://docs.crawl4ai.com/) tutorials, demonstrating how to integrate crawl4ai with Intuned's browser automation infrastructure.

<!-- IDE-IGNORE-START -->
## Run on Intuned

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/crawl4ai" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>

## Getting Started

### Install dependencies

```bash
uv sync
```

If the `intuned` CLI is not installed, install it globally:

```bash
npm install -g @intuned/cli
```

After installing dependencies, `intuned` command should be available in your environment.

### Run an API

```bash
intuned dev run api simple-crawl .parameters/api/simple-crawl/default.json
intuned dev run api deep-crawl .parameters/api/deep-crawl/default.json
intuned dev run api multi-crawl .parameters/api/multi-crawl/default.json
intuned dev run api content-selection/css-based .parameters/api/content-selection/css-based/default.json
intuned dev run api content-selection/llm-based .parameters/api/content-selection/llm-based/default.json
intuned dev run api adaptive-crawl/statistical .parameters/api/adaptive-crawl/statistical/default.json
intuned dev run api adaptive-crawl/embedding .parameters/api/adaptive-crawl/embedding/default.json
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

## APIs

### Core Crawling

| API | Description |
| ----- | ------------- |
| `simple-crawl` | Crawls a single URL and returns the page content as clean markdown |
| `deep-crawl` | Deep crawl a website following links with BFS, DFS, or Best-First strategies |
| `multi-crawl` | Crawl multiple URLs concurrently with dispatchers for rate limiting and memory management |

### Content Selection

| API | Description |
| ----- | ------------- |
| `content-selection/css-based` | Extract structured data from a webpage using CSS selectors with content filtering |
| `content-selection/llm-based` | Extract structured data using an LLM with a Pydantic schema |

### Adaptive Crawling

| API | Description |
| ----- | ------------- |
| `adaptive-crawl/statistical` | Adaptive crawling with statistical strategy (term-based analysis) |
| `adaptive-crawl/embedding` | Adaptive crawling with embedding strategy (semantic understanding) |

## Project Structure

```text
/
├── api/
│   ├── simple-crawl.py               # Single URL crawl
│   ├── deep-crawl.py                 # Deep crawl with BFS/DFS
│   ├── multi-crawl.py                # Concurrent multi-URL crawl
│   ├── content-selection/
│   │   ├── css-based.py              # CSS selector extraction
│   │   └── llm-based.py              # LLM-based extraction
│   └── adaptive-crawl/
│       ├── statistical.py            # Statistical adaptive crawl
│       └── embedding.py              # Embedding adaptive crawl
├── intuned-resources/
│   └── jobs/
│       ├── simple-crawl.job.jsonc
│       ├── deep-crawl.job.jsonc
│       ├── multi-crawl.job.jsonc
│       ├── content-selection/
│       │   ├── css-based.job.jsonc
│       │   └── llm-based.job.jsonc
│       └── adaptive-crawl/
│           ├── statistical.job.jsonc
│           └── embedding.job.jsonc
├── .parameters/api/                  # Parameter files for testing
├── Intuned.jsonc
└── pyproject.toml
```

## Related

- [Intuned CLI](https://docs.intunedhq.com/docs/05-references/cli/overview)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [crawl4ai Documentation](https://docs.crawl4ai.com/)
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
