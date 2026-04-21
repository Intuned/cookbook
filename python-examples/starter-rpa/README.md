# starter-rpa (Python)

Minimal RPA starter. Fills and submits a consultation booking form on [sandbox.intuned.dev](https://sandbox.intuned.dev).

<!-- IDE-IGNORE-START -->
<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/starter-rpa" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>
<!-- IDE-IGNORE-END -->

## APIs

| API | Description |
| --- | ----------- |
| `book-consultation` | Fill a multi-field form and confirm submission |

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
intuned dev run api book-consultation .parameters/api/book-consultation/default.json
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
starter-rpa/
├── api/
│   └── book-consultation.py                # Minimal form fill + submit
├── intuned-resources/
│   └── jobs/
│       └── book-consultation.job.jsonc
├── .parameters/
│   └── api/
│       └── book-consultation/
│           └── default.json
├── Intuned.jsonc
├── pyproject.toml
└── README.md
```

## Related

- [Intuned CLI](https://intunedhq.com/docs/main/05-references/cli/overview)
- [Intuned llm.txt](https://intunedhq.com/docs/llms.txt)
