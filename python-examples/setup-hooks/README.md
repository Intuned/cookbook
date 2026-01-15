# setup-hooks Intuned project

Example demonstrating how to use setup hooks in Intuned to prepare data and configuration before your API executes

## Run on Intuned

Open this project in Intuned by clicking the button below.

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/setup-hooks" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>

## Development

> **_NOTE:_**  All commands support `--help` flag to get more information about the command and its arguments and options.

### Install dependencies
```bash
uv sync
```

After installing dependencies, `intuned` command should be available in your environment.

### Run an API
```bash
uv run intuned run api demo-hook .parameters/api/demo-hook/default.json
```

### Deploy project
```bash
uv run intuned deploy
```




### `intuned-browser`: Intuned Browser SDK

This project uses Intuned browser SDK. For more information, check out the [Intuned Browser SDK documentation](https://docs.intunedhq.com/automation-sdks/overview).




## Project Structure
The project structure is as follows:
```
/
├── api/                      # Your API endpoints
│   └── demo-hook.py          # Demo API showing hook data usage
├── hooks/                    # Setup hooks executed before API runs
│   └── setup_context.py      # Main setup hook
├── utils/                    # Utility functions and schemas
│   └── types_and_schemas.py  # Pydantic models and type definitions
├── .parameters/              # Parameter files for testing APIs
│   └── api/                  # API parameters folder
│       └── demo-hook/        # Parameters for demo API
│           └── default.json  # Default parameters
└── Intuned.jsonc             # Intuned project configuration file
```

## Learn More

- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
