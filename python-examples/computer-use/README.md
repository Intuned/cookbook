# Computer Use Automation

AI-powered browser automation using computer use capabilities from multiple providers with Intuned's infrastructure.

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

**Parameters**:
```json
{
  "query": "Go to https://books.toscrape.com, navigate to the Science Fiction category, and list the top 5 books"
}
```

### OpenAI Operator API (`api/openai-computer-use.py`)

OpenAI's Operator model for autonomous browser control.

**Parameters**:
```json
{
  "query": "Go to https://books.toscrape.com and find me the cheapest book in the Travel category"
}
```

### Gemini Computer Use (`api/gemini-computer-use.py`)

Google's Gemini with Stagehand for enhanced computer use automation.

**Parameters**:
```json
{
  "query": "Go to https://books.toscrape.com, find the most expensive book on the first page"
}
```

### Browser Use (`api/browser-use-template.py`)

Browser Use library for agentic browser automation.

**Parameters**:
```json
{
  "query": "Go to https://automationintesting.online. Fill in check-in date 25/12/2025 and check-out date 27/12/2025"
}
```

## How It Works

### Anthropic & OpenAI Implementations
Both use native computer use APIs that operate with X/Y coordinates to control the browser, mimicking human computer interaction. They capture screenshots, decide on actions, and execute mouse/keyboard commands.

### Gemini Implementation
Uses Stagehand with Gemini's computer use capabilities, combining CUA (Computer Use API) with Stagehand's agent framework for enhanced automation.

### Browser Use Implementation
Uses the Browser Use library which provides DOM-based automation with built-in tools for common browser tasks, operating via CDP for direct browser control.

## Getting Started

### Install Dependencies
```bash
uv sync
```

### Set Up Environment Variables
Create a `.env` file with your API keys:
```bash
INTUNED_API_KEY=your_intuned_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_google_api_key_here
```

### Run an API
```bash
# Anthropic Computer Use
uv run intuned run api anthropic-computer-use '{"query":"Go to https://books.toscrape.com, navigate to Science Fiction"}'

# OpenAI Operator API
uv run intuned run api openai-computer-use '{"query":"Go to https://books.toscrape.com and find the cheapest book"}'

# Gemini Computer Use
uv run intuned run api gemini-computer-use '{"query":"Go to https://books.toscrape.com, find the most expensive book"}'

# Browser Use
uv run intuned run api browser-use-template '{"query":"Go to https://automationintesting.online"}'
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
│   └── browser-use-template.py     # Browser Use
├── hooks/
│   └── setup_context.py            # Setup hook for Stagehand and Browser Use
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

## Acknowledgments

The Anthropic and OpenAI implementations were built using templates from [create-kernel-app](https://github.com/onkernel/create-kernel-app).
