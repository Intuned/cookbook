# Computer Use Automation (TypeScript)

AI-powered browser automation using computer use capabilities from multiple providers with Intuned's infrastructure.

<!-- IDE-IGNORE-START -->
## Run on Intuned

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/computer-use" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>
<!-- IDE-IGNORE-END -->

## Overview

This project demonstrates four different approaches to AI-powered browser automation:

### 1. Anthropic Computer Use

Uses Claude's native computer use API with X/Y coordinate-based interactions and extended thinking capabilities.

### 2. OpenAI Operator API

Uses OpenAI's computer-use-preview model (Operator API) for autonomous browser control with X/Y coordinate-based interactions.

### 3. Gemini Computer Use

Uses Google's Gemini with Stagehand for computer use automation, leveraging Gemini's CUA capabilities with Stagehand's agent framework.

### 4. Stagehand (Non-CUA)

Stagehand agent without computer use API for traditional DOM-based automation.

## APIs

### Anthropic Computer Use (`api/anthropic-computer-use.ts`)

Claude-powered automation using native computer use tools.

**Parameters**:

```typescript
{
  query: string;  // The task you want the AI to perform
}
```

### OpenAI Operator API (`api/openai-computer-use.ts`)

OpenAI's Operator model for autonomous browser control.

**Parameters**:

```typescript
{
  query: string;  // The task you want the AI to perform
}
```

### Gemini Computer Use (`api/gemini-computer-use.ts`)

Google's Gemini with Stagehand for enhanced computer use automation.

**Parameters**:

```typescript
{
  query: string;  // The task you want the AI to perform
}
```

### Stagehand (`api/stagehand.ts`)

Stagehand agent without computer use API for traditional DOM-based automation.

**Parameters**:

```typescript
{
  query: string;  // The task you want the AI to perform
}
```

## How It Works

### Anthropic & OpenAI Implementations

Both use native computer use APIs that operate with X/Y coordinates to control the browser, mimicking human computer interaction. They capture screenshots, decide on actions, and execute mouse/keyboard commands.

### Gemini Implementation

Uses Stagehand with Gemini's computer use capabilities, combining CUA (Computer Use API) with Stagehand's agent framework for enhanced automation.

### Stagehand Implementation

Uses the Stagehand library which provides DOM-based automation with built-in tools for common browser tasks.

<!-- IDE-IGNORE-START -->
## Getting started

### Install dependencies

```bash
npm install
# or
yarn
```

If the `intuned` CLI is not installed, install it globally:

```bash
npm install -g @intuned/cli
```

After installing dependencies, `intuned` command should be available in your environment.

### Environment Variables

The Gemini Computer Use implementation requires `GEMINI_API_KEY`:

```bash
export GEMINI_API_KEY=your_api_key_here
```

### Run an API

```bash
# Anthropic Computer Use
intuned dev run api anthropic-computer-use .parameters/api/anthropic-computer-use/default.json

# OpenAI Operator API
intuned dev run api openai-computer-use .parameters/api/openai-computer-use/default.json

# Gemini Computer Use
intuned dev run api gemini-computer-use .parameters/api/gemini-computer-use/default.json

# Stagehand
intuned dev run api stagehand .parameters/api/stagehand/default.json
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
│   ├── anthropic-computer-use.ts   # Anthropic Claude computer use
│   ├── openai-computer-use.ts      # OpenAI Operator API
│   ├── gemini-computer-use.ts      # Gemini with Stagehand
│   └── stagehand.ts                # Stagehand without CUA
├── hooks/
│   └── setupContext.ts             # Setup hook for Stagehand and Gemini
├── .parameters/api/                # Parameter files for each API
│   ├── anthropic-computer-use/
│   │   └── default.json
│   ├── openai-computer-use/
│   │   └── default.json
│   ├── gemini-computer-use/
│   │   └── default.json
│   └── stagehand/
│       └── default.json
├── lib/                            # Shared libraries for Anthropic and OpenAI
│   ├── anthropic/                  # Anthropic computer use implementation
│   └── openai/                     # OpenAI computer use implementation
├── intuned-resources/
│   └── jobs/
│       ├── anthropic-computer-use.job.jsonc  # Job for Anthropic computer use
│       ├── openai-computer-use.job.jsonc     # Job for OpenAI computer use
│       └── stagehand.job.jsonc               # Job for Stagehand
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript configuration
└── Intuned.jsonc                   # Intuned configuration
```

## Related

- [Intuned CLI](https://docs.intunedhq.com/docs/05-references/cli/overview)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- **Anthropic Computer Use**: <https://docs.anthropic.com/en/docs/computer-use>
- **OpenAI Operator API**: <https://platform.openai.com/docs/>
- **Stagehand Documentation**: <https://docs.stagehand.dev/>
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)

## Acknowledgments

The Anthropic and OpenAI implementations were built using templates from [create-kernel-app](https://github.com/onkernel/create-kernel-app).
