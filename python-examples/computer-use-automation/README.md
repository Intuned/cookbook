# Computer Use Automation

AI-powered browser automation using computer use capabilities from multiple providers with Intuned's infrastructure.

## Getting Started

To get started developing browser automation projects with Intuned, check out our [concepts and terminology](https://docs.intunedhq.com/docs/00-getting-started/introduction).

## Overview

This project includes implementations for multiple AI providers that support computer use:
- **Anthropic Computer Use** - Claude's native computer use API with extended thinking capabilities
- **OpenAI Operator API** - OpenAI's computer-use-preview model for autonomous browser control
- **Gemini Computer Use** - Google's Gemini with Stagehand for computer use automation
- **Browser Use Template** - Browser-use library for agentic browser automation (Python only)

## Prerequisites

Before running the examples, you'll need:
- Python 3.12+ installed
- `uv` package manager installed
- API keys for the AI provider(s) you want to use:
  - `ANTHROPIC_API_KEY` - For Anthropic Computer Use
  - `OPENAI_API_KEY` - For OpenAI Operator API
  - `GOOGLE_GENERATIVE_AI_API_KEY` - For Gemini Computer Use

Create a `.env` file in the project root:
```bash
INTUNED_API_KEY=your_intuned_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key_here
```

## APIs

### Anthropic Computer Use

Uses Anthropic's Claude with native computer use capabilities and extended thinking.

**File**: `api/anthropic-computer-use.py`

**Parameters**:
```python
{
  "query": str,        # The task you want the AI to perform
  "api_key": str,      # Your Anthropic API key (optional, falls back to env)
  "model": str,        # Model to use (default: 'claude-sonnet-4-20250514')
}
```

**Example Usage**:
```bash
uv run intuned run api anthropic-computer-use '{"query":"Go to https://books.toscrape.com, navigate to the Science Fiction category, and list the top 5 books with their prices"}';
```

**Features**:
- Native computer use tools (mouse, keyboard, screenshot)
- Extended thinking for complex reasoning
- Automatic retry logic
- Prompt caching for efficiency
- Full conversation history tracking

### OpenAI Operator API (Computer Use)

Uses OpenAI's computer-use-preview model (Operator API) with native computer use capabilities.

**File**: `api/openai-computer-use.py`

**Parameters**:
```python
{
  "query": str,        # The task you want the AI to perform
  "api_key": str,      # Your OpenAI API key (optional, falls back to env)
  "model": str,        # Model to use (default: 'computer-use-preview')
}
```

**Example Usage**:
```bash
uv run intuned run api openai-computer-use '{"query":"Go to https://books.toscrape.com and find me the cheapest book in the Travel category. Tell me its title and price."}';
```

**Features**:
- Native computer use tools (mouse, keyboard, screenshot)
- Navigation tools (goto, back, forward)
- Automatic viewport configuration
- Full conversation history tracking
- Safety check callbacks

### Gemini Computer Use

Uses Google's Gemini 2.5 with Stagehand for computer use automation.

**File**: `api/gemini-computer-use.py`

**Parameters**:
```python
{
  "query": str,        # The task you want the AI to perform
  "api_key": str,      # Your Google Generative AI API key (optional, falls back to env)
  "model": str,        # Model to use (default: 'gemini-2.5-computer-use-preview-10-2025')
}
```

**Example Usage**:
```bash
uv run intuned run api gemini-computer-use '{"query":"Go to https://books.toscrape.com, find the most expensive book on the first page, and tell me its title and price"}';
```

**Features**:
- Gemini 2.5 computer use preview
- Stagehand integration for enhanced automation
- Built-in element detection
- Automatic viewport configuration

### Browser Use Template

Uses the browser-use library for agentic browser automation (Python only).

**File**: `api/browser-use-template.py`

**Parameters**:
```python
{
  "check_in_date": str,      # Check-in date in DD/MM/YYYY format
  "check_out_date": str,     # Check-out date in DD/MM/YYYY format
  "budget": float,           # Maximum budget in pounds
  "first_name": str,         # Guest first name
  "last_name": str,          # Guest last name
  "phone_number": str,       # Guest phone number
  "email": str,              # Guest email
  "extra_details": str,      # Additional requirements or preferences (optional)
  "model": str,              # Model to use (default: 'gpt-5-nano', optional)
}
```

**Example Usage**:
```bash
uv run intuned run api browser-use-template '{"check_in_date":"25/12/2025","check_out_date":"27/12/2025","budget":150,"first_name":"John","last_name":"Doe","phone_number":"01234567890","email":"john.doe@example.com","extra_details":"Prefer a room with a view"}';
```

**Features**:
- Browser-use agent for complex browser tasks
- Hotel booking automation example
- OpenAI integration
- Flash mode for faster execution
- Structured parameter handling

## Development

> **_NOTE:_** All commands support `--help` flag to get more information about the command and its arguments and options.

### Install dependencies
```bash
uv sync
```

After installing dependencies, `intuned` command should be available in your environment.

### Run an API
```bash
uv run intuned run api <api-name> '<json-parameters>'
```

**Examples**:

```bash
# Anthropic Computer Use
uv run intuned run api anthropic-computer-use '{"query":"Go to https://books.toscrape.com, navigate to the Science Fiction category, and list the top 5 books with their prices"}';

# OpenAI Operator API
uv run intuned run api openai-computer-use '{"query":"Go to https://books.toscrape.com and find me the cheapest book in the Travel category. Tell me its title and price."}';

# Gemini Computer Use
uv run intuned run api gemini-computer-use '{"query":"Go to https://books.toscrape.com, find the most expensive book on the first page, and tell me its title and price"}';

# Browser Use Template
uv run intuned run api browser-use-template '{"check_in_date":"25/12/2025","check_out_date":"27/12/2025","budget":150,"first_name":"John","last_name":"Doe","phone_number":"01234567890","email":"john.doe@example.com","extra_details":"Prefer a room with a view"}';
```

### Deploy project
```bash
uv run intuned deploy
```

## How It Works

### Anthropic Implementation (Claude)

1. **Initialization**: The sampling loop is initialized with your query and API key
2. **Tool Setup**: Computer use tools are configured for the Playwright page
3. **Agentic Loop**:
   - Claude receives the current state (including screenshots)
   - Claude decides which actions to take using computer use tools
   - Actions are executed on the browser
   - Results (including screenshots) are sent back to Claude
   - Loop continues until task is complete or max iterations reached
4. **Result Storage**: Final results and conversation history are stored

### OpenAI Implementation (Operator API)

1. **Initialization**: The agent is initialized with your task and API key
2. **Computer Setup**: Computer use tools are configured for the Playwright page
3. **Agentic Loop**:
   - GPT receives the current state (including screenshots)
   - GPT decides which actions to take using computer use or navigation tools
   - Actions are executed on the browser
   - Results (including screenshots) are sent back to GPT
   - Loop continues until task is complete
4. **Result Storage**: Final results and elapsed time are returned

### Stagehand Implementation (Gemini)

The Gemini implementation uses Stagehand, which provides:
- Higher-level automation abstractions
- Built-in element detection
- Simplified interaction patterns

### Browser Use Implementation

The Browser Use implementation provides:
- Agentic browser automation
- CDP-based control
- Flash mode for faster execution
- Built-in tools for common tasks

## Project Structure
```
/
├── api/                           # Your API endpoints 
│   ├── anthropic-computer-use.py   # Anthropic Claude computer use
│   ├── openai-computer-use.py      # OpenAI Operator API
│   ├── gemini-computer-use.py      # Gemini with Stagehand
│   └── browser-use-template.py     # Browser-use template
├── hooks/                         # Setup hooks
│   └── setup_context.py
├── lib/                           # Shared libraries
│   ├── anthropic/                 # Anthropic computer use implementation
│   │   └── utils/
│   └── openai/                    # OpenAI computer use implementation
│       ├── agent.py
│       ├── computers/
│       └── toolset.py
├── pyproject.toml                 # Project dependencies
└── Intuned.jsonc                  # Intuned project configuration
```

## Resources

- [Intuned Documentation](https://docs.intunedhq.com/docs/00-getting-started/introduction)
- [Anthropic Computer Use](https://docs.anthropic.com/en/docs/computer-use)
- [OpenAI Operator API](https://platform.openai.com/docs/)
- [Stagehand Documentation](https://docs.stagehand.dev/)
- [Browser Use Documentation](https://github.com/browser-use/browser-use)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/intuned-sdk/overview)
