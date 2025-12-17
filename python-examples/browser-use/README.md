# Browser-Use Integration

AI-powered browser automation using the browser-use library to autonomously complete web tasks.

## Getting Started

To get started developing browser automation projects with Intuned, check out the
- Intuned docs [here](https://docs.intunedhq.com/docs/00-getting-started/introduction)
- CLI docs [here](https://docs.intunedhq.com/docs/05-references/cli)
- Intuned.jsonc docs [here](https://docs.intunedhq.com/docs/05-references/intuned-json#intuned-json)


## Development

> **_NOTE:_**  All commands support `--help` flag to get more information about the command and its arguments and options.

### Install dependencies
```bash
uv sync
```

After installing dependencies, `intuned` command should be available in your environment.

### Run an API

Run the book_room API with test parameters:
```bash
uv run intuned run api book_room .parameters/book_room/default.json
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
│   └── book_room.py          # AI agent that books a hotel room based on criteria
├── hooks/                    # Lifecycle hooks
│   └── setup_context.py      # Sets up browser-use Browser instance
├── .parameters/              # Test parameters for local development
│   └── book_room/
│       └── default.json      # Default parameters for book_room API
└── Intuned.jsonc             # Intuned project configuration file
```


## About Browser-Use Integration

This example demonstrates how to integrate the [browser-use](https://github.com/browser-use/browser-use) library with Intuned. Browser-use is an AI-powered browser automation library that uses LLMs to autonomously complete web tasks.

### Key Features

- **AI-Powered Navigation**: The agent autonomously navigates websites and completes tasks based on natural language instructions
- **CDP Integration**: Uses Chrome DevTools Protocol (CDP) for direct browser control
- **Intuned AI Gateway**: Automatically configured to use Intuned's AI gateway (no API keys needed)
- **Custom Browser Setup**: Uses `setup_context` hook to initialize browser-use with Intuned's browser

### How It Works

1. **setup_context.py**: Initializes a browser-use `Browser` instance connected to Intuned's CDP endpoint
2. **book_room.py**: Creates an AI agent with a task description and runs it on the browser
3. **AI Gateway**: Uses `get_ai_gateway_config()` from runtime helpers to automatically configure LLM access

### Example Use Case

The `book_room` API demonstrates an agent that:
1. Navigates to a hotel booking website
2. Searches for rooms with specific check-in/out dates
3. Filters rooms by budget and preferences
4. Completes the booking form with user details

All of this is done autonomously by the AI agent based on the task description.

### Notes

- Actions performed by browser-use via CDP are not visible in Playwright traces
- The AI gateway provides temporary access to LLMs without requiring your own API keys
- You can customize the agent's behavior by modifying the task description and parameters
