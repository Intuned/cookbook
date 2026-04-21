# starter-scrapy (Python)

Minimal Scrapy starter. Scrapes a single page of quotes using Scrapy inside an Intuned automation.

<!-- IDE-IGNORE-START -->
<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/starter-scrapy" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>
<!-- IDE-IGNORE-END -->

## APIs

| API | Description |
| --- | ----------- |
| `scrapy-crawler` | Run a Scrapy spider against a URL and collect items |

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
intuned dev run api scrapy-crawler .parameters/api/scrapy-crawler/default.json
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
starter-scrapy/
├── api/
│   └── scrapy-crawler.py                   # Minimal Scrapy spider
├── intuned-resources/
│   └── jobs/
│       └── scrapy-crawler.job.jsonc
├── .parameters/
│   └── api/
│       └── scrapy-crawler/
│           └── default.json
├── Intuned.jsonc
├── pyproject.toml
└── README.md
```

## Related

- [Scrapy docs](https://docs.scrapy.org)
- [Intuned CLI](https://intunedhq.com/docs/main/05-references/cli/overview)
- [Intuned llm.txt](https://intunedhq.com/docs/llms.txt)
