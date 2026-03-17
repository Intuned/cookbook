# Scrapy (Python)

Web scraping examples using Scrapy framework.

<!-- IDE-IGNORE-START -->
## Run on Intuned

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/scrapy" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>
<!-- IDE-IGNORE-END -->

## APIs

| API | Description |
| --- | ----------- |
| `scrapy-crawler` | Scrapes static websites using Scrapy's built-in HTTP request system and CSS/XPath selectors |
| `scrapy-crawler-js` | Renders JavaScript-heavy pages with Playwright, then parses the HTML output using Scrapy |

<!-- IDE-IGNORE-START -->
## Getting started

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
intuned dev run api scrapy-crawler .parameters/api/scrapy-crawler/default.json
intuned dev run api scrapy-crawler-js .parameters/api/scrapy-crawler-js/default.json
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
│   ├── scrapy-crawler.py     # Scrapy crawler using Scrapy's HTTP requests
│   └── scrapy-crawler-js.py  # Scrapy crawler using Playwright + Scrapy parsing
├── collector/
│   └── item_collector.py     # Collects scraped items via Scrapy signals
├── utils/
│   └── types_and_schemas.py  # Pydantic models for parameters and data
├── intuned-resources/
│   └── jobs/
│       ├── scrapy-crawler.job.jsonc    # Job for static site crawling
│       └── scrapy-crawler-js.job.jsonc # Job for JS-rendered crawling
├── .parameters/api/          # Test parameters
├── Intuned.jsonc             # Project config
├── pyproject.toml            # Python dependencies
└── README.md
```

## Key features

- **`scrapy-crawler`**: Best for static websites — uses Scrapy's `CrawlerRunner` for HTTP requests, CSS selectors, and pagination
- **`scrapy-crawler-js`**: Best for JavaScript-heavy sites — uses Playwright to render pages before Scrapy parses the HTML

## Related

- [Intuned CLI](https://docs.intunedhq.com/docs/05-references/cli/overview)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [Scrapy Documentation](https://docs.scrapy.org/)
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
