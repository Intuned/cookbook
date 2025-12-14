# AI-Powered Browser Helpers

This folder contains AI-powered helper functions from the Intuned Browser SDK that leverage large language models for intelligent web automation tasks.

## ⚠️ Important Notes

### API Keys Required
These AI helpers require valid API keys from supported AI providers:
- **OpenAI** (GPT-4, GPT-4o, etc.)
- **Anthropic** (Claude models)
- **Google** (Gemini models)

API keys can be provided through:
1. **Environment variables** (local development)
2. **Function parameters** (direct API key override)
3. **Intuned Gateway**: If no API Key is provided, we will use Intuned's API Gateway for AI calls and it will be charged on workspace.

### AI Credits Usage
**These helpers consume AI credits** from your provider account. Each function call will:
- Make requests to the AI provider's API
- Incur costs based on:
  - Model used
  - Input tokens (content being analyzed)
  - Output tokens (structured data generated)

**Cost Considerations:**
- Page content extraction can use significant tokens for large pages
- Image analysis typically costs more than text
- Consider implementing caching for repeated operations

## Available AI Helpers

### `extractStructuredData`
Extract structured data from text, images, or web pages using AI.

**Features:**
- Extract data from text or image content
- Extract data directly from web pages
- Support for JSON schemas for type safety
- Multiple AI model support

**Example:**
```typescript
import { extractStructuredData, TextContentItem } from "@intuned/browser/ai";

// Extract from text
const textContent: TextContentItem = {
  type: "text",
  data: "John Doe, age 30, works as a Software Engineer at Tech Corp"
};

const person = await extractStructuredData({
  content: textContent,
  model: "gpt-4o",
  dataSchema: {
    type: "object",
    properties: {
      name: { type: "string" },
      age: { type: "number" },
      occupation: { type: "string" },
      company: { type: "string" }
    },
    required: ["name"]
  },
  prompt: "Extract person information from the text"
});

console.log(`Found person: ${person.name}, ${person.age} years old`);
```

**Documentation:** [extractStructuredData](https://docs.intunedhq.com/automation-sdks/intuned-sdk/typescript/ai/functions/extractStructuredData)

### `isPageLoaded`
Use AI to intelligently determine if a page has finished loading.

**Features:**
- AI-powered page load detection
- Understands dynamic content loading
- More reliable than simple timeout waits
- Can detect partial loads and errors

**Example:**
```typescript
import { isPageLoaded } from "@intuned/browser/ai";

await page.goto("https://example.com");
const pageLoaded = await isPageLoaded({ page });
if (pageLoaded) {
  console.log("Page is fully loaded");
} else {
  console.log("Page is still loading");
}
```

**Documentation:** [isPageLoaded](https://docs.intunedhq.com/automation-sdks/intuned-sdk/typescript/ai/functions/isPageLoaded)

## Configuration

### Setting API Keys

#### Local Development (Environment Variables)
```bash
export OPENAI_API_KEY="your-openai-key"
export ANTHROPIC_API_KEY="your-anthropic-key"
export GOOGLE_API_KEY="your-google-key"
```

#### Deployed Projects (Intuned Dashboard)
When your project is deployed to Intuned:

1. Navigate to your project dashboard on Intuned
2. Open the **"Environment Variables"** tab
3. Click **"+ New"** to add environment variables:
   - Key: `OPENAI_API_KEY`, Value: `your-openai-key`
   - Key: `ANTHROPIC_API_KEY`, Value: `your-anthropic-key`
   - Key: `GOOGLE_API_KEY`, Value: `your-google-key`
4. Select the environments (development, production) where these should be available

**Documentation:** [Intuned Environment Variables](https://docs.intunedhq.com/docs-old/platform/develop/environment-variables)

#### In Code (Direct Override)
```typescript
// Pass API key directly to functions
const result = await extractStructuredData({
  content: content,
  model: "gpt-4o",
  dataSchema: Schema,
  apiKey: "your-api-key", // Optional: override default
});
```

## Best Practices

1. **Choose the Right Model**
   - Use cheaper models (GPT-3.5, Claude Haiku) for simple tasks
   - Reserve expensive models (GPT-4, Claude Opus) for complex extraction

2. **Minimize Token Usage**
   - Extract only the content you need before passing to AI
   - Use specific selectors to narrow down page content
   - Consider chunking large pages

3. **Implement Error Handling**
   - AI responses can fail or timeout
   - Always handle potential errors gracefully
   - Consider retry logic for transient failures

4. **Cache Results**
   - Cache AI responses when processing the same content
   - Implement deduplication for repeated extractions

5. **Monitor Costs**
   - Track API usage through your provider's dashboard
   - Set up billing alerts
   - Log token usage in your application

## Examples

See the example files in this directory:
- `extract-structured-data.ts` - Comprehensive extraction examples
- `is-page-loaded.ts` - Page load detection example

## Learn More

- [Intuned AI Helpers Documentation](https://docs.intunedhq.com/automation-sdks/intuned-sdk/overview)
- [Browser SDK TypeScript Reference](https://docs.intunedhq.com/automation-sdks/intuned-sdk/typescript/helpers/functions/)

