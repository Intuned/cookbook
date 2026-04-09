# Computer Use Automation

AI-powered browser automation using computer use capabilities from multiple providers with Intuned's infrastructure.

<!-- IDE-IGNORE-START -->
## Run on Intuned

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/computer-use" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>
<!-- IDE-IGNORE-END -->

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

### Environment Variables

For Gemini Computer Use:

```bash
export GEMINI_API_KEY=your-gemini-api-key
```

### Run an API

```bash
# Anthropic Computer Use
intuned dev run api anthropic-computer-use .parameters/api/anthropic-computer-use/default.json

# OpenAI Operator API
intuned dev run api openai-computer-use .parameters/api/openai-computer-use/default.json

# Gemini Computer Use
intuned dev run api gemini-computer-use .parameters/api/gemini-computer-use/default.json

# Browser Use
intuned dev run api browser-use .parameters/api/browser-use/default.json
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

```text
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
├── intuned-resources/
│   └── jobs/
│       ├── anthropic-computer-use.job.jsonc  # Job for Anthropic computer use
│       ├── openai-computer-use.job.jsonc     # Job for OpenAI computer use
│       ├── gemini-computer-use.job.jsonc     # Job for Gemini computer use
│       └── browser-use.job.jsonc             # Job for Browser Use
├── pyproject.toml                  # Dependencies
└── Intuned.jsonc                   # Intuned configuration
```

## Related

- [Intuned CLI](https://intunedhq.com/docs/main/05-references/cli/overview)
- [Intuned Browser SDK](https://intunedhq.com/docs/automation-sdks/overview)
- **Anthropic Computer Use**: <https://docs.anthropic.com/en/docs/computer-use>
- **OpenAI Operator API**: <https://platform.openai.com/docs/>
- **Stagehand Documentation**: <https://docs.stagehand.dev/>
- **Browser Use Documentation**: <https://github.com/browser-use/browser-use>
- [Intuned llm.txt](https://intunedhq.com/docs/llms.txt)

## Acknowledgments

The Anthropic and OpenAI implementations were built using templates from [create-kernel-app](https://github.com/onkernel/create-kernel-app).
