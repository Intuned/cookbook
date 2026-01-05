# empty Intuned project

This template is a setup with no boilerplate that can get you started quickly. All the project structure, configuration files, and folder organization are already in place—just setup your parameters, rename your API, and write down your automation code. Everything else is ready to go.

<!-- IDE-IGNORE-START -->
## Run on Intuned

[![Run on Intuned](https://cdn1.intuned.io/button.svg)](https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/empty)

## Getting Started

To get started developing browser automation projects with Intuned, check out our [concepts and terminology](https://docs.intunedhq.com/docs/getting-started/conceptual-guides/core-concepts#runs%3A-executing-your-automations).


## Development

> **_NOTE:_**  All commands support `--help` flag to get more information about the command and its arguments and options.

### Install dependencies
```bash
uv sync
```

After installing dependencies, `intuned` command should be available in your environment.

### Run an API
```bash
uv run intuned run api sample .parameters/api/sample/default.json
```

### Save project
```bash
uv run intuned save
```

Reference for saving project [here](https://docs.intunedhq.com/docs/02-features/local-development-cli#use-runtime-sdk-and-browser-sdk-helpers)

### Deploy project
```bash
uv run intuned deploy
```

### `intuned-browser`: Intuned Browser SDK

This project uses Intuned browser SDK. For more information, check out the [Intuned Browser SDK documentation](https://docs.intunedhq.com/automation-sdks/overview).

<!-- IDE-IGNORE-END -->




## Project Structure
```
/
├── .parameters/              # Test parameters for APIs
│   └── api/
│       └── sample/
│           └── default.json
├── api/                      # API endpoints
│   └── sample.py            # Sample API endpoint
├── Intuned.jsonc            # Intuned project configuration
└── pyproject.toml           # Python project dependencies
```


## APIs

| API | Description |
|-----|-------------|
| `sample` | A basic sample API that demonstrates the Intuned project structure and API pattern |


## Learn More

- [Intuned Documentation](https://docs.intunedhq.com)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [Getting Started Guide](https://docs.intunedhq.com/docs/00-getting-started/introduction)
- [CLI Reference](https://docs.intunedhq.com/docs/05-references/cli)
- [Intuned.jsonc Reference](https://docs.intunedhq.com/docs/05-references/intuned-json)
