# Computer Use Automation

AI-powered browser automation examples using different computer use implementations with Intuned.

## APIs

### Anthropic Computer Use

Uses Claude's native computer use API with extended thinking capabilities.

**File**: `api/anthropic-computer-use.ts`

**Parameters**:
```typescript
{
  query: string;  // The task you want the AI to perform
}
```

**Example**:
```bash
npm run intuned run api anthropic-computer-use '{"query":"Go to https://books.toscrape.com, navigate to the Science Fiction category, and list the top 5 books with their prices"}';
```

---

### OpenAI Computer Use

Uses OpenAI's computer-use-preview model (Operator API) for autonomous browser control.

**File**: `api/openai-computer-use.ts`

**Parameters**:
```typescript
{
  query: string;  // The task you want the AI to perform
}
```

**Example**:
```bash
npm run intuned run api openai-computer-use '{"query":"Go to https://books.toscrape.com and find me the cheapest book in the Travel category"}';
```

---

### Gemini Computer Use

Uses Google's Gemini 2.5 with Stagehand for computer use automation (CUA enabled).

**File**: `api/gemini-computer-use.ts`

**Parameters**:
```typescript
{
  query: string;  // The task you want the AI to perform
}
```

**Example**:
```bash
npm run intuned run api gemini-computer-use '{"query":"Go to https://books.toscrape.com, find the most expensive book on the first page, and tell me its title and price"}';
```

---

### Stagehand (Non-CUA)

Stagehand agent without computer use API for traditional DOM-based automation.

**File**: `api/stagehand.ts`

**Parameters**:
```typescript
{
  query: string;  // The task you want the AI to perform
}
```

**Example**:
```bash
npm run intuned run api stagehand '{"query":"Go to https://books.toscrape.com, navigate to the Travel category, and tell me the title and price of the first book you see"}';
```

---

## Getting Started

### Prerequisites

Create a `.env` file with the required API keys:

```bash
INTUNED_API_KEY=your_intuned_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here  # For Anthropic Computer Use
OPENAI_API_KEY=your_openai_api_key_here        # For OpenAI Computer Use
GEMINI_API_KEY=your_google_api_key_here        # For Gemini Computer Use
```

### Install Dependencies

```bash
npm install
# or
yarn install
```

### Run an API

```bash
npm run intuned run api anthropic-computer-use .parameters/api/anthropic-computer-use/default.json
npm run intuned run api openai-computer-use .parameters/api/openai-computer-use/default.json
npm run intuned run api gemini-computer-use .parameters/api/gemini-computer-use/default.json
npm run intuned run api stagehand .parameters/api/stagehand/default.json
```

### Deploy

```bash
npm run intuned deploy
```

## Project Structure

```
/
├── api/
│   ├── anthropic-computer-use.ts
│   ├── openai-computer-use.ts
│   ├── gemini-computer-use.ts
│   └── stagehand.ts
├── hooks/
│   └── setupContext.ts
├── lib/
│   ├── anthropic/    # Anthropic computer use implementation
│   └── openai/       # OpenAI computer use implementation
└── Intuned.jsonc
```

## Acknowledgments

The Anthropic and OpenAI implementations were built using templates from [create-kernel-app](https://github.com/onkernel/create-kernel-app), a CLI tool for scaffolding Kernel browser automation applications.

## Learn More

- [Intuned Documentation](https://docs.intunedhq.com)
- [Anthropic Computer Use](https://docs.anthropic.com/en/docs/computer-use)
- [Stagehand Documentation](https://docs.stagehand.dev/)
