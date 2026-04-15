# stagehand (Python)

AI-powered browser automation using Stagehand library.

<!-- IDE-IGNORE-START -->
<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/stagehand" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>
<!-- IDE-IGNORE-END -->

## APIs

| API | Description |
| --- | ----------- |
| `get-books` | Scrapes books from books.toscrape.com using Stagehand's AI-powered act/observe/extract methods, with optional category filtering and automatic pagination |

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

### Prepare the project

Before running any API, provision and deploy the project first.

```bash
intuned dev provision
intuned dev deploy
```

### Run an API

```bash
intuned dev run api get-books .parameters/api/get-books/travel-category.json
intuned dev run api get-books .parameters/api/get-books/no-category-all-books.json
```
<!-- IDE-IGNORE-END -->

## Project Structure

```
stagehand/
├── api/
│   └── get-books.py                   # Scrapes books by category using Stagehand AI methods
├── hooks/
│   └── setup_context.py               # Stores CDP URL in attempt_store before each API call
├── intuned-resources/
│   └── jobs/
│       └── get-books.job.jsonc        # Job definition for get-books API
├── .parameters/
│   └── api/
│       └── get-books/
│           ├── travel-category.json
│           └── no-category-all-books.json
├── Intuned.jsonc
├── pyproject.toml
└── README.md
```

## Related

- [Intuned CLI](https://intunedhq.com/docs/main/05-references/cli/overview)
- [Intuned Browser SDK](https://intunedhq.com/docs/automation-sdks/overview)
- [Intuned llm.txt](https://intunedhq.com/docs/llms.txt)
