# Intuned Cookbook

This is a cookbook repository with TypeScript and Python examples for the Intuned browser automation platform.

## Project Structure

- `typescript-examples/` - TypeScript examples (17 projects)
- `python-examples/` - Python examples (19 projects)
- Each example is a self-contained project with its own dependencies

## Testing APIs with the Intuned CLI

The Intuned CLI lets you run and test APIs locally before deploying. The commands differ slightly between TypeScript and Python.

### TypeScript

```bash
# Navigate to your project
cd typescript-examples/your-project

# Install dependencies
yarn install

# Run an API with parameters from a JSON file
yarn intuned run api <api-name> <path-to-params.json>

# Examples
yarn intuned run api 01-basic-navigation .parameters/api/01-basic-navigation/default.json
yarn intuned run api scrape-products .parameters/api/scrape-products/default.json
```

### Python

```bash
# Navigate to your project
cd python-examples/your-project

# Install dependencies (uses uv package manager)
uv sync

# Run an API with parameters from a JSON file
uv run intuned run api <api-name> <path-to-params.json>

# Examples
uv run intuned run api 01-basic-navigation .parameters/api/01-basic-navigation/default.json
uv run intuned run api scrape-products .parameters/api/scrape-products/default.json
```

### With Auth Sessions

If the project has auth sessions enabled, you need to provide an auth session ID:

```bash
# TypeScript
yarn intuned run api <api-name> <params.json> --auth-session <auth-session-id>

# Python
uv run intuned run api <api-name> <params.json> --auth-session <auth-session-id>
```

### Parameter Files

Parameters are stored in `.parameters/api/{api-name}/default.json`. Each API should have a corresponding parameter file:

```
.parameters/
└── api/
    ├── 01-basic-navigation/
    │   └── default.json      # {"url": "https://example.com"}
    ├── scrape-products/
    │   └── default.json      # {}
    └── fill-form/
        └── default.json      # {"firstName": "John", "email": "john@example.com"}
```

### Useful CLI Flags

**Headless mode** — Run without a visible browser window. Faster execution, recommended when you don't need to watch the automation:

```bash
# TypeScript
yarn intuned run api scrape-products .parameters/api/scrape-products/default.json --headless

# Python
uv run intuned run api scrape-products .parameters/api/scrape-products/default.json --headless
```

**Keep browser open** — Keeps the browser open after execution finishes. Useful for debugging or when you want to inspect the final state and ask questions:

```bash
# TypeScript
yarn intuned run api fill-form .parameters/api/fill-form/default.json --keep-browser-open

# Python
uv run intuned run api fill-form .parameters/api/fill-form/default.json --keep-browser-open
```

**Enable tracing** — Saves a Playwright trace for debugging failed runs:

```bash
yarn intuned run api my-api .parameters/api/my-api/default.json --trace
# Trace saved to ./traces/<timestamp>
```

**Other useful flags:**
- `--retries <n>` — Retry failed executions (default: 1)
- `--timeout <duration>` — Set execution timeout (default: 10 mins)
- `--proxy <url>` — Use a proxy for browser connections
- `-o, --output-file <path>` — Save results to a JSON file

For full CLI reference, see: https://docs.intunedhq.com/docs/05-references/cli#run-api

### CLI Help

```bash
# Get help on any command
yarn intuned run api --help   # TypeScript
uv run intuned run api --help # Python
```

## File Conventions

- Use `Intuned.jsonc` (not `Intuned.json`) for Intuned project configuration files
- **API filenames must use kebab-case** (lowercase with hyphens, e.g., `get-products.ts`, `fill-form.py`)
  - Valid: `get-user.ts`, `submit-form.py`, `extract-data.ts`
  - Invalid: `getUser.ts`, `get_user.py`, `extractData.ts`
  - Nested APIs follow the same convention: `api/orders/get-order.ts`

## Renaming APIs

When renaming an API file, you MUST update all related files:
1. **Rename the API file**: `api/{old-name}.ts` → `api/{new-name}.ts`
2. **Rename the parameters folder**: `.parameters/api/{old-name}/` → `.parameters/api/{new-name}/`
3. **Update the README**: Update any references to the old API name in the project's README.md (run commands, descriptions, etc.)

## Template Validation

For the full template specification, see **`TEMPLATE_SPEC.md`** in the repository root.

Templates are validated by CI using `.github/scripts/validate-templates.sh`. Run it locally to check for issues:
```bash
.github/scripts/validate-templates.sh
```

The validation checks:
- `Intuned.jsonc` exists (not `.json`)
- No `workspaceId` field in `Intuned.jsonc` (should not be committed)
- `metadata.template.name` and `metadata.template.description` are set
- `metadata.tags` is set (warning if missing)
- API filenames use kebab-case
- `.parameters/api/{api-name}/default.json` exists for each API
- Auth session files exist when `authSessions.enabled=true`
- README.md doesn't have template placeholders or incorrect references

## Intuned.jsonc Metadata

Each project's `Intuned.jsonc` must include a `metadata` section with the following fields:

```jsonc
{
  // ... other config ...
  "metadata": {
    "defaultJobInput": {},           // Optional: default input for job runs
    "defaultRunPlaygroundInput": {}, // Optional: default input for playground runs
    "testAuthSessionInput": {},      // Optional: input for testing auth sessions
    "tags": ["scraping", "ai"],      // Optional: array of tags for categorization
    "template": {
      "name": "Template Name",       // Required: display name for the template
      "description": "Description"   // Required: brief description of what the template does
    }
  }
}
```

**apiAccess field:**
- `apiAccess`: Controls whether the project has API access enabled
- When creating a new template, always ask the user if `apiAccess` should be enabled or not

## AI Gateway Configuration

For projects that use AI (e.g., browser-use, SDK templates with LLM calls, Stagehand):

**Use `get_ai_gateway_config` from Intuned runtime** - do NOT ask users for Anthropic/OpenAI API keys.

```typescript
// TypeScript
import { getAiGatewayConfig } from '@intuned/runtime';
const { baseUrl, apiKey } = await getAiGatewayConfig();
```

```python
# Python - returns a tuple (base_url, api_key)
from intuned_runtime import get_ai_gateway_config
base_url, api_key = get_ai_gateway_config()
```

**Key points:**
- Python: Returns a tuple `(base_url, api_key)` - use tuple unpacking
- TypeScript: Returns an object with `baseUrl` and `apiKey` properties
- Templates should use this gateway instead of requiring users to provide their own AI provider keys
- Applies to: browser-use templates, Stagehand templates, any template making LLM API calls

### Stagehand Integration

#### TypeScript

Stagehand v3 uses the AI SDK pattern with `AISdkClient`:

```typescript
import { Stagehand, AISdkClient } from "@browserbasehq/stagehand";
import { createOpenAI } from "@ai-sdk/openai";
import { attemptStore, getAiGatewayConfig } from "@intuned/runtime";

// Get AI gateway config
const { baseUrl, apiKey } = await getAiGatewayConfig();
const cdpUrl = attemptStore.get("cdpUrl") as string;

// Create AI SDK provider with Intuned's AI gateway
const openai = createOpenAI({
  apiKey,
  baseURL: baseUrl,
});

const llmClient = new AISdkClient({
  model: openai("gpt-4o"),  // or your preferred model
});

// Initialize Stagehand
const stagehand = new Stagehand({
  env: "LOCAL",
  localBrowserLaunchOptions: {
    cdpUrl: webSocketUrl,
    viewport: { width: 1280, height: 800 },
  },
  llmClient,
});
await stagehand.init();

// Use Stagehand methods directly (not on stagehand.page)
await stagehand.act("Click the submit button");
await stagehand.observe("the search input field");
const result = await stagehand.extract("Extract the product details", schema);

// For navigation, use the playwright page
await page.goto("https://example.com");
```

**TypeScript key points:**
- Import `AISdkClient` from `@browserbasehq/stagehand` and `createOpenAI` from `@ai-sdk/openai`
- Create the provider with `createOpenAI({ apiKey, baseURL })`
- Pass `llmClient` to Stagehand (not `modelClientOptions`)
- Call `stagehand.act()`, `stagehand.observe()`, `stagehand.extract()` directly on stagehand
- Use `page.goto()` for navigation (playwright page)
- Always call `await stagehand.close()` in a finally block

#### Python

```python
from intuned_runtime import attempt_store, get_ai_gateway_config
from stagehand import Stagehand

base_url, api_key = get_ai_gateway_config()
cdp_url = attempt_store.get("cdp_url")

stagehand = Stagehand(
    env="LOCAL",
    local_browser_launch_options=dict(
        cdp_url=cdp_url, viewport=dict(width=1280, height=800)
    ),
    model_api_key=api_key,
    model_client_options={
        "baseURL": base_url,
    },
)
await stagehand.init()

# Use Stagehand methods directly (not on stagehand.page)
await stagehand.act("Click the submit button")
await stagehand.observe("the search input field")
result = await stagehand.extract("Extract the product details", MySchema)

# For navigation, use the playwright page
await page.goto("https://example.com")
```

**Python key points:**
- Use `attempt_store.get("cdp_url")` to get the CDP URL for connecting to the browser
- Pass `api_key` to `model_api_key` parameter
- Pass `base_url` to `model_client_options["baseURL"]`
- Call `stagehand.act()`, `stagehand.observe()`, `stagehand.extract()` directly on stagehand
- Use `page.goto()` for navigation (playwright page)
- Always call `await stagehand.close()` in a finally block

**Review checklist for Intuned.jsonc:**
- [ ] `metadata.template.name` is set
- [ ] `metadata.template.description` is set
- [ ] `metadata.defaultJobInput` set if project has APIs with inputs
- [ ] `metadata.defaultRunPlaygroundInput` set if needed
- [ ] `metadata.testAuthSessionInput` set if project uses auth sessions
- [ ] `apiAccess` is explicitly set (ask user for preference on new templates)

## Project README Template

Each project README must include the "Getting Started" template from:
- TypeScript: `typescript-examples/project_getting_started_template.md`
- Python: `python-examples/project_getting_started_template.md`

**When adding template to a project README, follow these markdown comments in the template:**

1. **Run an API section**: Replace `<api-name>` and `<parameters>` with actual values. Include an example command for EACH API in the project, using the `.parameters` folder JSON files as examples. **Always use `.parameters/{api-name}/default.json` paths - never use inline JSON like `'{}'`.**

2. **Project Structure section**: Update the tree structure to match the actual project structure (files, folders, and their descriptions).

3. **Envs section**: Document all environment variables the project requires.

4. **Config file reference**: The template may show `intuned.json` - always change to `intuned.jsonc`.

**Review checklist for project READMEs:**
- [ ] Template sections are customized (not generic placeholders)
- [ ] All APIs have run examples with correct parameter paths
- [ ] Project structure matches actual files
- [ ] Environment variables documented
- [ ] Uses `intuned.jsonc` not `intuned.json`

## Parameters Folder Structure

Each project must have a `.parameters/` folder containing test parameters for running APIs locally.

**Structure:**
```
.parameters/
├── api/                  # API parameters folder
│   └── {api-name}/       # Folder for each API (matches api filename without extension)
│       └── default.json  # Default parameters JSON
└── auth-sessions/        # Auth session parameters (if project uses auth sessions)
    ├── check/            # Check auth session parameters
    │   └── default.json
    └── create/           # Create auth session parameters
        └── default.json
```

**Requirements:**
- Create `.parameters/api/{api-name}/default.json` for each API in `api/` directory
- Include `auth-sessions/check/default.json` and `auth-sessions/create/default.json` if project has `auth-sessions/` folder
- JSON files contain the input parameters for testing the API

## Main README Structure

- Two tables: "TypeScript Examples" and "Python Examples"
- Each table: Example | Description
- Links point to `typescript-examples/{example}/` and `python-examples/{example}/`

## Examples Structure

- Each language folder has README with table listing all examples
- Examples include: `quick-recipes`, `rpa-example`, `rpa-auth-example`, authentication examples, captcha solving, etc.

## Quick Recipes

- Each recipe is an API file in `api/` folder: `{recipe-name}.ts` or `{recipe-name}.py`
- Recipes: download-file, pagination, upload-to-s3, capture-screenshots
- Quick recipes README lists all APIs in a table with descriptions

## RPA Examples

- Complete Intuned projects with full project structure
- `rpa-example`: Basic automation without authentication
- `rpa-auth-example`: Authenticated automation with Auth Sessions

## Auth Sessions

- Projects with Auth Sessions enabled must include `auth-sessions-instances/` directory
- Each auth session instance is stored in a subdirectory named with the auth session ID
- Each instance directory contains: `auth-session.json` and `metadata.json`
- Example: `auth-sessions-instances/test-auth-session/auth-session.json` and `metadata.json`
- These files are used during local development; when deployed, AuthSession data is stored on Intuned's infrastructure

## Documentation Links

- AuthSessions: https://docs.intunedhq.com/docs/02-features/auth-sessions
- Browser SDK: https://docs.intunedhq.com/automation-sdks/intuned-sdk/overview
- Intuned in depth: https://docs.intunedhq.com/docs/01-learn/deep-dives/intuned-indepth
- Introduction / Quickstarts: https://docs.intunedhq.com/docs/00-getting-started/introduction
- Recipe docs: https://docs.intunedhq.com/docs/01-learn/recipes/

### SDK Method Patterns

- TypeScript: `https://docs.intunedhq.com/automation-sdks/intuned-sdk/typescript/helpers/functions/{functionName}`
- Python: `https://docs.intunedhq.com/automation-sdks/intuned-sdk/python/helpers/functions/{function_name}`
- Common methods: downloadFile/download_file, uploadFileToS3/upload_file_to_s3, saveFileToS3/save_file_to_s3

## Keep READMEs in Sync

When modifying examples:
- Add/remove example: update main README (both TS and Python tables) + language-specific examples README
- Modify example code: update example README if description/features change
- Rename files/folders: update all README links and names

Quick check:
- Main README tables up to date
- Examples READMEs accurate
- Links match actual paths
- Descriptions reflect code
