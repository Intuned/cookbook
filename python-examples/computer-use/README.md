# Computer Use Automation

AI-powered browser automation using computer use capabilities from multiple providers with Intuned's infrastructure.

## Run on Intuned

[![Run on Intuned](https://cdn1.intuned.io/button.svg)](https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/computer-use)

## Overview

This project demonstrates four different approaches to AI-powered browser automation:

### 1. Anthropic Computer Use
Uses Claude's native computer use API with X/Y coordinate-based interactions and extended thinking capabilities.

### 2. OpenAI Operator API
Uses OpenAI's computer-use-preview model (Operator API) for autonomous browser control with X/Y coordinate-based interactions.

### 3. Gemini Computer Use
Uses Google's Gemini with Stagehand for computer use automation, leveraging Gemini's CUA capabilities with Stagehand's agent framework.

### 4. Browser Use
Uses the Browser Use library for agentic browser automation with DOM-based interactions and built-in tools.

## APIs

### Anthropic Computer Use (`api/anthropic-computer-use.py`)

Claude-powered automation using native computer use tools.

**Parameters**: See `.parameters/api/anthropic-computer-use/default.json`

### OpenAI Operator API (`api/openai-computer-use.py`)

OpenAI's Operator model for autonomous browser control.

**Parameters**: See `.parameters/api/openai-computer-use/default.json`

### Gemini Computer Use (`api/gemini-computer-use.py`)

Google's Gemini with Stagehand for enhanced computer use automation.

**Parameters**: See `.parameters/api/gemini-computer-use/default.json`

### Browser Use (`api/browser-use.py`)

Browser Use library for agentic browser automation.

**Parameters**: See `.parameters/api/browser-use/default.json`

## How It Works

### Anthropic & OpenAI Implementations
Both use native computer use APIs that operate with X/Y coordinates to control the browser, mimicking human computer interaction. They capture screenshots, decide on actions, and execute mouse/keyboard commands.

### Gemini Implementation
Uses Stagehand with Gemini's computer use capabilities, combining CUA (Computer Use API) with Stagehand's agent framework for enhanced automation.

### Browser Use Implementation
Uses the Browser Use library which provides DOM-based automation with built-in tools for common browser tasks, operating via CDP for direct browser control.

## Getting Started

**Important:** This project uses AI-powered computer use capabilities (Anthropic, OpenAI, Gemini, and Browser Use) that require Intuned's AI gateway. The AI gateway requires the project to be saved before running.

### Setup

To run this example locally, you need to set up your Intuned workspace:

1. **Create a workspace** - Follow the [workspace management guide](https://docs.intunedhq.com/docs/03-how-to/manage/manage-workspace) to create your Intuned workspace

2. **Get your API key** - Generate an API key from the [API keys page](https://docs.intunedhq.com/docs/03-how-to/manage/manage-api-keys#how-to-manage-api-keys) in your Intuned dashboard

3. **Configure workspace ID** - Add your workspace ID and Project Name to `Intuned.jsonc`:
   ```jsonc
   {
     "workspaceId": "your-workspace-id",
     "projectName": "your-project-name"
     // ... rest of config
   }
   ```

4. **Set environment variables**:
   ```bash
   export INTUNED_API_KEY=your-api-key
   
   # For Gemini Computer Use implementation
   export GEMINI_API_KEY=your-gemini-api-key
   ```

### Install Dependencies
```bash
uv sync
```

### Initialize Project

Run the save command to upload your project and set up the required `.env` file:

```bash
uv run intuned save
```

This configures your local environment and prepares the AI gateway for running computer use automations.

Reference for saving project [here](https://docs.intunedhq.com/docs/02-features/local-development-cli#use-runtime-sdk-and-browser-sdk-helpers)

### Run an API
```bash
# Anthropic Computer Use
uv run intuned run api anthropic-computer-use .parameters/api/anthropic-computer-use/default.json

# OpenAI Operator API
uv run intuned run api openai-computer-use .parameters/api/openai-computer-use/default.json

# Gemini Computer Use
uv run intuned run api gemini-computer-use .parameters/api/gemini-computer-use/default.json

# Browser Use
uv run intuned run api browser-use .parameters/api/browser-use/default.json
```

### Deploy to Intuned
```bash
uv run intuned deploy
```

## Project Structure
```
/
├── api/
│   ├── anthropic-computer-use.py   # Anthropic Claude computer use
│   ├── openai-computer-use.py      # OpenAI Operator API
│   ├── gemini-computer-use.py      # Gemini with Stagehand
│   └── browser-use.py              # Browser Use
├── hooks/
│   └── setup_context.py            # Setup hook for Stagehand and Browser Use
├── .parameters/api/                # Parameter files for each API
│   ├── anthropic-computer-use/
│   │   └── default.json
│   ├── openai-computer-use/
│   │   └── default.json
│   ├── gemini-computer-use/
│   │   └── default.json
│   └── browser-use/
│       └── default.json
├── lib/                            # Shared libraries for Anthropic and OpenAI
├── pyproject.toml                  # Dependencies
└── Intuned.jsonc                   # Intuned configuration
```

## Learn More

- **Intuned Documentation**: https://docs.intunedhq.com/docs/00-getting-started/introduction
- **Anthropic Computer Use**: https://docs.anthropic.com/en/docs/computer-use
- **OpenAI Operator API**: https://platform.openai.com/docs/
- **Stagehand Documentation**: https://docs.stagehand.dev/
- **Browser Use Documentation**: https://github.com/browser-use/browser-use
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)

## Acknowledgments

The Anthropic and OpenAI implementations were built using templates from [create-kernel-app](https://github.com/onkernel/create-kernel-app).
