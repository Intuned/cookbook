# computer-use (Python)

AI-powered browser automation using computer use capabilities from multiple providers.

<!-- IDE-IGNORE-START -->
<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/computer-use" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>
<!-- IDE-IGNORE-END -->

## APIs

| API | Description |
| --- | ----------- |
| `anthropic-computer-use` | Autonomous browser automation using Claude's native computer use API with X/Y coordinate-based interactions |
| `openai-computer-use` | Autonomous browser automation using OpenAI's computer-use-preview model (Operator API) |
| `gemini-computer-use` | Browser automation using Google Gemini with Stagehand's CUA (Computer Use API) framework |
| `browser-use` | Agentic browser automation using the Browser Use library with DOM-based interactions |

### Provider Notes

**Anthropic Computer Use** — Uses Claude's native computer use tools. Requires Intuned's AI gateway (no separate API key needed).

**OpenAI Operator API** — Uses `computer-use-preview` model via OpenAI's Responses API. Requires Intuned's AI gateway.

**Gemini Computer Use** — Uses Stagehand (`stagehand~=0.5.7`) with Gemini's CUA capabilities. Requires `GEMINI_API_KEY`:

```bash
export GEMINI_API_KEY=your_gemini_api_key
```

**Browser Use** — Uses the `browser-use` library for DOM-based agentic automation via CDP.

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

```
├── api/
│   ├── anthropic-computer-use.py        # Anthropic Claude computer use
│   ├── openai-computer-use.py           # OpenAI Operator API
│   ├── gemini-computer-use.py           # Gemini with Stagehand CUA
│   └── browser-use.py                   # Browser Use library
├── hooks/
│   └── setup_context.py                 # Sets up Stagehand/Browser Use context
├── lib/
│   ├── anthropic/                       # Anthropic CUA tools and sampling loop
│   └── openai/                          # OpenAI CUA agent and computer helpers
├── intuned-resources/
│   └── jobs/
│       ├── anthropic-computer-use.job.jsonc
│       ├── openai-computer-use.job.jsonc
│       ├── gemini-computer-use.job.jsonc
│       └── browser-use.job.jsonc
├── .parameters/api/                     # Default parameter files for each API
├── Intuned.jsonc
├── pyproject.toml
└── README.md
```

## Related

- [Intuned CLI](https://docs.intunedhq.com/docs/05-references/cli/overview)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
