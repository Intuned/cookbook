# computer-use (TypeScript)

AI-powered browser automation using computer use capabilities from multiple providers.

<!-- IDE-IGNORE-START -->
<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/computer-use" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>
<!-- IDE-IGNORE-END -->

## APIs

| API | Description |
| --- | ----------- |
| `anthropic-computer-use` | Autonomous browser automation using Claude's native computer use API with X/Y coordinate-based interactions |
| `openai-computer-use` | Autonomous browser automation using OpenAI's computer-use-preview model (Operator API) |
| `gemini-computer-use` | Browser automation using Google Gemini with Stagehand's CUA (Computer Use API) framework |
| `stagehand` | DOM-based browser automation using the Stagehand library without computer use |

### Provider Notes

**Anthropic Computer Use** — Uses Claude's native computer use tools. Requires Intuned's AI gateway (no separate API key needed).

**OpenAI Operator API** — Uses `computer-use-preview` model via OpenAI's Responses API. Requires Intuned's AI gateway.

**Gemini Computer Use** — Uses `@browserbasehq/stagehand` with Gemini's CUA capabilities. Requires `GEMINI_API_KEY`:

```bash
export GEMINI_API_KEY=your_gemini_api_key
```

**Stagehand** — Uses `@browserbasehq/stagehand` for DOM-based agentic automation. Requires Intuned's AI gateway.

<!-- IDE-IGNORE-START -->
## Getting Started

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

### Run an API

```bash
intuned dev run api anthropic-computer-use .parameters/api/anthropic-computer-use/default.json
```

```bash
intuned dev run api openai-computer-use .parameters/api/openai-computer-use/default.json
```

```bash
intuned dev run api gemini-computer-use .parameters/api/gemini-computer-use/default.json
```

```bash
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

```
├── api/
│   ├── anthropic-computer-use.ts        # Anthropic Claude computer use
│   ├── openai-computer-use.ts           # OpenAI Operator API
│   ├── gemini-computer-use.ts           # Gemini with Stagehand CUA
│   └── stagehand.ts                     # Stagehand without CUA
├── hooks/
│   └── setupContext.ts                  # Sets up Stagehand context
├── lib/
│   ├── anthropic/                       # Anthropic CUA tools and sampling loop
│   └── openai/                         # OpenAI CUA agent and computer helpers
├── intuned-resources/
│   └── jobs/
│       ├── anthropic-computer-use.job.jsonc
│       ├── openai-computer-use.job.jsonc
│       ├── gemini-computer-use.job.jsonc
│       └── stagehand.job.jsonc
├── .parameters/api/                     # Default parameter files for each API
├── Intuned.jsonc
├── package.json
└── README.md
```

## Related

- [Intuned CLI](https://docs.intunedhq.com/docs/05-references/cli/overview)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
