# starter-bs4 (Python)

Minimal BeautifulSoup starter. Scrapes a single product listing page.

<!-- IDE-IGNORE-START -->
<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/starter-bs4" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>
<!-- IDE-IGNORE-END -->

## APIs

| API | Description |
| --- | ----------- |
| `list` | Navigate to a listing page and parse products with BeautifulSoup |

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
intuned dev run api list .parameters/api/list/default.json
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
starter-bs4/
├── api/
│   └── list.py                             # Minimal BS4 product scraper
├── intuned-resources/
│   └── jobs/
│       └── list.job.jsonc
├── .parameters/
│   └── api/
│       └── list/
│           └── default.json
├── Intuned.jsonc
├── pyproject.toml
└── README.md
```

## Related

- [BeautifulSoup docs](https://www.crummy.com/software/BeautifulSoup/bs4/doc/)
- [Intuned CLI](https://intunedhq.com/docs/main/05-references/cli/overview)
- [Intuned llm.txt](https://intunedhq.com/docs/llms.txt)
