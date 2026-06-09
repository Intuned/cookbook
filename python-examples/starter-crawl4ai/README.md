# starter-crawl4ai (Python)

Minimal [Crawl4AI](https://crawl4ai.com) starter — crawls a single URL and returns the page content as clean markdown.

For deep crawling, multi-URL crawling, content selection, and adaptive crawling, see the [Crawl4AI documentation](https://docs.crawl4ai.com/).

<!-- IDE-IGNORE-START -->
<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/starter-crawl4ai" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>
<!-- IDE-IGNORE-END -->

## APIs

| API | Description |
| --- | ----------- |
| `simple-crawl` | Crawls a single URL and returns the page content as clean markdown |

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

After installing dependencies, `intuned` command should be available in your environment.

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
│   └── simple-crawl.py                # Crawl a single URL to markdown
├── intuned-resources/
│   └── jobs/
│       └── simple-crawl.job.jsonc     # Job definition for simple-crawl API
├── .parameters/
│   └── api/
│       └── simple-crawl/
├── Intuned.jsonc
├── pyproject.toml
└── README.md
```

## Related

- [Crawl4AI Documentation](https://docs.crawl4ai.com/)
- [Intuned CLI](https://intunedhq.com/docs/main/05-references/cli/overview)
- [Intuned Browser SDK](https://intunedhq.com/docs/automation-sdks/overview)
- [Intuned llm.txt](https://intunedhq.com/docs/llms.txt)
