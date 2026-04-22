# starter-shopify (Python)

Minimal starter that scrapes a single product from any Shopify store using the public `/products/{handle}.json` endpoint.

<!-- IDE-IGNORE-START -->
<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/starter-shopify" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>
<!-- IDE-IGNORE-END -->

## APIs

| API | Description |
| --- | ----------- |
| `sample` | Fetch a single Shopify product's details as JSON |

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
intuned dev run api sample .parameters/api/sample/default.json
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
starter-shopify/
├── api/
│   └── sample.py
├── intuned-resources/
│   └── jobs/
│       └── sample.job.jsonc
├── .parameters/
│   └── api/
│       └── sample/
│           └── default.json
├── Intuned.jsonc
├── pyproject.toml
└── README.md
```

## Related

- [Intuned CLI](https://intunedhq.com/docs/main/05-references/cli/overview)
- [Shopify product JSON API](https://shopify.dev/docs/api/ajax/reference/product)
- [Intuned llm.txt](https://intunedhq.com/docs/llms.txt)
