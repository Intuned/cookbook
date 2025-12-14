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

### `extract_structured_data`
Extract structured data from text, images, or web pages using AI.

**Features:**
- Extract data from text or image content
- Extract data directly from web pages
- Support for Pydantic schemas for type safety
- Multiple AI model support

**Example:**
```python
from intuned_browser.ai import extract_structured_data
from pydantic import BaseModel, Field

class Person(BaseModel):
    name: str = Field(description="Person's full name")
    age: int = Field(description="Person's age")
    occupation: str = Field(description="Person's job title")

# Extract from text
person = await extract_structured_data(
    content={"type": "text", "data": "John Doe, age 30, Software Engineer"},
    model="gpt-4o",
    data_schema=Person
)
```

**Documentation:** [extract_structured_data](https://docs.intunedhq.com/automation-sdks/intuned-sdk/python/ai/functions/extract_structured_data)

### `is_page_loaded`
Use AI to intelligently determine if a page has finished loading.

**Features:**
- AI-powered page load detection
- Understands dynamic content loading
- More reliable than simple timeout waits
- Can detect partial loads and errors

**Example:**
```python
from intuned_browser.ai import is_page_loaded

await page.goto('https://example.com')
page_loaded = await is_page_loaded(page)
if page_loaded:
    print("Page is fully loaded")
else:
    print("Page is still loading")
```

**Documentation:** [is_page_loaded](https://docs.intunedhq.com/automation-sdks/intuned-sdk/python/ai/functions/is_page_loaded)

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
```python
# Pass API key directly to functions
result = await extract_structured_data(
    content=content,
    model="gpt-4o",
    data_schema=Schema,
    api_key="your-api-key"  # Optional: override default
)
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
- `extract-structured-data.py` - Comprehensive extraction examples
- `is-page-loaded.py` - Page load detection example

## Learn More

- [Intuned AI Helpers Documentation](https://docs.intunedhq.com/automation-sdks/intuned-sdk/overview)
- [Browser SDK Python Reference](https://docs.intunedhq.com/automation-sdks/intuned-sdk/python/helpers/functions/)

