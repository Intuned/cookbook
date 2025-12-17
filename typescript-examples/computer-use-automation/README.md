# Computer Use Automation

This example demonstrates how to use AI models with computer use capabilities to automate browser tasks using Intuned's infrastructure.

## Overview

This project includes implementations for multiple AI providers that support computer use:
- **Anthropic Computer Use** - Claude's native computer use API with extended thinking capabilities
- **OpenAI Operator API** - OpenAI's computer-use-preview model for autonomous browser control
- **Gemini Computer Use** - Google's Gemini with Stagehand for computer use automation
- **Stagehand Template** - Reusable template for non-computer use Stagehand agents (TypeScript only)

## Getting Started

To get started developing browser automation projects with Intuned, check out our [concepts and terminology](https://docs.intunedhq.com/docs/getting-started/conceptual-guides/core-concepts#runs%3A-executing-your-automations).

### Prerequisites

Before running the examples, you'll need:
- Node.js installed
- Intuned API key (sign up at [intunedhq.com](https://intunedhq.com))
- API keys for the AI provider(s) you want to use

## Environment Variables

This project requires the following environment variables. Create a `.env` file in the project root with the variables you need:

```bash
# Required - Intuned API key for browser automation infrastructure
INTUNED_API_KEY=your_intuned_api_key_here

# AI Provider Keys - Add only the ones you need for the APIs you want to use

# For Anthropic Computer Use API (api/anthropic-computer-use.ts)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# For OpenAI Operator API (api/openai-computer-use.ts)
OPENAI_API_KEY=your_openai_api_key_here

# For Gemini Computer Use API (api/gemini-computer-use.ts)
GEMINI_API_KEY=your_google_api_key_here

# For Stagehand Template (api/stagehand-template.ts)
# Uses Anthropic-compatible API - either use ANTHROPIC_API_KEY above
# or Intuned's AI Gateway (no additional key needed when deployed)
```

**Note**: The Stagehand template can use either your Anthropic API key or Intuned's AI Gateway when deployed to the platform.

## APIs

### Anthropic Computer Use

Uses Anthropic's Claude with native computer use capabilities and extended thinking.

**File**: `api/anthropic-computer-use.ts`

**Parameters**:
```typescript
{
  query: string;        // The task you want the AI to perform
}
```

**Example Usage**:
```bash
# Using default parameters
npm run intuned run api anthropic-computer-use --parameters .parameters/anthropic-computer-use/default.json

# Or with inline JSON
npm run intuned run api anthropic-computer-use '{"query":"Go to https://books.toscrape.com, navigate to the Science Fiction category, and list the top 5 books with their prices"}'
```

**Features**:
- Native computer use tools (mouse, keyboard, screenshot)
- Extended thinking for complex reasoning
- Automatic retry logic
- Prompt caching for efficiency
- Full conversation history tracking

### OpenAI Operator API (Computer Use)

Uses OpenAI's computer-use-preview model (Operator API) with native computer use capabilities.

**File**: `api/openai-computer-use.ts`

**Parameters**:
```typescript
{
  query: string;        // The task you want the AI to perform
}
```

**Example Usage**:
```bash
# Using default parameters
npm run intuned run api openai-computer-use --parameters .parameters/openai-computer-use/default.json

# Or with inline JSON
npm run intuned run api openai-computer-use '{"query":"Go to https://books.toscrape.com and find me the cheapest book in the Travel category. Tell me its title and price."}'
```

**Features**:
- Native computer use tools (mouse, keyboard, screenshot)
- Navigation tools (goto, back, forward)
- Automatic viewport configuration
- Full conversation history tracking
- Safety check callbacks

### Gemini Computer Use

Uses Google's Gemini 2.5 with Stagehand for computer use automation.

**File**: `api/gemini-computer-use.ts`

**Parameters**:
```typescript
{
  query: string;        // The task you want the AI to perform
}
```

**Example Usage**:
```bash
# Using default parameters
npm run intuned run api gemini-computer-use --parameters .parameters/gemini-computer-use/default.json

# Or with inline JSON
npm run intuned run api gemini-computer-use '{"query":"Go to https://books.toscrape.com, find the most expensive book on the first page, and tell me its title and price"}'
```

**Features**:
- Gemini 2.5 computer use preview
- Stagehand integration for enhanced automation
- Built-in element detection

### Stagehand Template

A reusable template for building non-computer use Stagehand-based automation (TypeScript only).

**File**: `api/stagehand-template.ts`

**Parameters**:
```typescript
{
 query: string;
}
```

**Example Usage**:
```bash
# Using default parameters
npm run intuned run api stagehand-template --parameters .parameters/stagehand-template/default.json

# Or with inline JSON
npm run intuned run api stagehand-template '{"query":"Go to https://automationintesting.online. Fill in check-in date 25/12/2025 and check-out date 27/12/2025. Search for rooms within budget of 150 pounds. Book a room with first name John, last name Doe, phone number 01234567890, and email john.doe@example.com"}'
```

**Features**:
- Stagehand agent for non-computer use tasks
- Hotel booking automation example
- Anthropic Claude integration
- Structured parameter handling

## Library Structure

### Anthropic Implementation

The Anthropic implementation includes a comprehensive library under `lib/anthropic/`:

```
lib/anthropic/
├── sampling-loop.ts           # Main agentic loop with tool execution
├── types/
│   ├── beta.ts               # Anthropic API types
│   └── computer.ts           # Computer use action types
├── tools/
│   ├── browser.ts            # Browser navigation tools
│   ├── collection.ts         # Tool version management
│   ├── computer.ts           # Computer tool implementation
│   └── utils/
│       ├── keyboard.ts       # Keyboard input utilities
│       └── validator.ts      # Action parameter validation
└── utils/
    ├── message-processing.ts # Message formatting and caching
    └── tool-results.ts       # Tool result formatting
```

### OpenAI Implementation

The OpenAI implementation includes a library under `lib/openai/`:

```
lib/openai/
├── agent.ts              # Main agentic loop with tool execution
├── computer.ts           # Computer tool implementation (Playwright)
├── toolset.ts            # Navigation tools (goto, back, forward)
└── utils.ts              # Message processing and API utilities
```

### Computer Actions Supported

**Anthropic Computer Tool**:

**Mouse Actions**:
- `left_click`, `right_click`, `middle_click`
- `double_click`, `triple_click`
- `mouse_move`
- `left_click_drag`
- `left_mouse_down`, `left_mouse_up`

**Keyboard Actions**:
- `key` - Key combinations (e.g., "ctrl+l")
- `type` - Type text with delay
- `hold_key` - Hold a key for duration

**System Actions**:
- `screenshot` - Capture current screen
- `cursor_position` - Get current cursor position
- `scroll` - Scroll in any direction
- `wait` - Wait for duration

**Navigation Actions** (via separate browser tool):
- `go_to_url` - Navigate to a URL (uses `page.goto()`)
- `go_back` - Go back to previous page

**OpenAI Computer Tool**:

All standard computer use actions plus built-in navigation:
- `goto` - Navigate to a URL
- `back` - Go back in browser history
- `forward` - Go forward in browser history
- `click`, `doubleClick`, `scroll`
- `type`, `keypress`
- `move`, `drag`
- `wait`, `screenshot`

## Development

> **_NOTE:_** All commands support `--help` flag to get more information about the command and its arguments and options.

### Install dependencies

```bash
npm install
# or
yarn install
```

### Run an API

```bash
# Using parameter files
npm run intuned run api <api-name> --parameters .parameters/<api-name>/default.json

# Or with inline JSON
npm run intuned run api <api-name> '<json-parameters>'
```

**Examples**:

```bash
# Anthropic Computer Use
npm run intuned run api anthropic-computer-use --parameters .parameters/anthropic-computer-use/default.json

# OpenAI Operator API
npm run intuned run api openai-computer-use --parameters .parameters/openai-computer-use/default.json

# Gemini Computer Use
npm run intuned run api gemini-computer-use --parameters .parameters/gemini-computer-use/default.json

# Stagehand Template
npm run intuned run api stagehand-template --parameters .parameters/stagehand-template/default.json
```

### Deploy project

```bash
npm run intuned deploy
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

### OpenAI Implementation

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

## Configuration

### Setup Context Hook

The `hooks/setupContext.ts` file initializes shared resources like Stagehand that can be reused across API calls:

```typescript
export default async function setupContext({ page, context }) {
  const stagehand = new Stagehand({
    page,
    // configuration...
  });
  
  attemptStore.set("stagehand", stagehand);
  
  return { page, context };
}
```

### Intuned Configuration

The `Intuned.jsonc` file contains project configuration including:
- Project metadata (name, description)
- API access settings
- Browser replication settings
- Default parameters for testing

See the [Intuned Configuration Reference](https://docs.intunedhq.com/docs/05-references/intuned-json) for more configuration options.

## Acknowledgments

The Anthropic and OpenAI implementations (`api/anthropic-computer-use.ts` and `api/openai-computer-use.ts`) were built using templates from [create-kernel-app](https://github.com/onkernel/create-kernel-app), a CLI tool for scaffolding Kernel browser automation applications.

## Resources

- [Intuned Documentation](https://docs.intunedhq.com/docs/00-getting-started/introduction)
- [Anthropic Computer Use](https://docs.anthropic.com/en/docs/computer-use)
- [Stagehand Documentation](https://docs.stagehand.dev/)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/intuned-sdk/overview)

## Project Structure

```
/
├── .parameters/              # Parameter presets for APIs
│   ├── anthropic-computer-use/
│   │   └── default.json
│   ├── gemini-computer-use/
│   │   └── default.json
│   ├── openai-computer-use/
│   │   └── default.json
│   └── stagehand-template/
│       └── default.json
├── api/                      # API endpoints
│   ├── anthropic-computer-use.ts
│   ├── gemini-computer-use.ts
│   ├── openai-computer-use.ts
│   └── stagehand-template.ts
├── hooks/                    # Setup hooks
│   └── setupContext.ts
├── lib/                      # Shared libraries
│   ├── anthropic/           # Anthropic computer use implementation
│   │   ├── sampling-loop.ts
│   │   ├── types/
│   │   ├── tools/
│   │   └── utils/
│   └── openai/              # OpenAI computer use implementation
│       ├── agent.ts
│       ├── computer.ts
│       ├── toolset.ts
│       └── utils.ts
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript configuration
└── Intuned.jsonc            # Intuned project configuration
```
