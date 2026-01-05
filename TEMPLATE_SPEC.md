# Intuned Template Specification

This document describes how to create new TypeScript or Python templates for the Intuned cookbook.

## Directory Structure

### TypeScript Template

```
typescript-examples/{template-name}/
├── api/                          # API endpoints
│   └── {api-name}.ts             # Each API is a separate file
├── auth-sessions/                # Only if authSessions.enabled = true
│   ├── check.ts                  # Validates if auth session is still valid
│   └── create.ts                 # Creates/recreates auth session programmatically
├── auth-sessions-instances/      # Only if authSessions.enabled = true
│   └── test-auth-session/        # Example auth session for testing
│       ├── auth-session.json     # Browser state (cookies, localStorage)
│       └── metadata.json         # Auth session metadata
├── .parameters/                  # Test parameters for APIs
│   ├── api/                      # API parameters folder
│   │   └── {api-name}/           # Folder per API (matches filename without extension)
│   │       └── default.json      # Default test parameters
│   └── auth-sessions/            # Only if authSessions.enabled = true
│       ├── check/                # Check auth session parameters
│       │   └── default.json
│       └── create/               # Create auth session parameters
│           └── default.json
├── .env.example                  # Example environment variables
├── .gitignore
├── Intuned.jsonc                 # Project configuration
├── package.json
├── tsconfig.json
└── README.md
```

### Python Template

```
python-examples/{template-name}/
├── api/                          # API endpoints
│   └── {api-name}.py             # Each API is a separate file
├── auth-sessions/                # Only if authSessions.enabled = true
│   ├── check.py                  # Validates if auth session is still valid
│   └── create.py                 # Creates/recreates auth session programmatically
├── auth-sessions-instances/      # Only if authSessions.enabled = true
│   └── test-auth-session/        # Example auth session for testing
│       ├── auth-session.json     # Browser state (cookies, localStorage)
│       └── metadata.json         # Auth session metadata
├── .parameters/                  # Test parameters for APIs
│   ├── api/                      # API parameters folder
│   │   └── {api-name}/           # Folder per API (matches filename without extension)
│   │       └── default.json      # Default test parameters
│   └── auth-sessions/            # Only if authSessions.enabled = true
│       ├── check/                # Check auth session parameters
│       │   └── default.json
│       └── create/               # Create auth session parameters
│           └── default.json
├── .env.example                  # Example environment variables
├── .gitignore
├── Intuned.jsonc                 # Project configuration
├── pyproject.toml
└── README.md
```

---

## Intuned.jsonc

Every template must have an `Intuned.jsonc` file.

**Documentation:** For the full Intuned.jsonc schema and options, see: https://docs.intunedhq.com/docs/01-learn/deep-dives/intuned-indepth

### Required Structure

```jsonc
{
  "apiAccess": {
    "enabled": true | false       // Enable API access via Intuned API
  },
  "authSessions": {
    "enabled": true | false,      // Enable auth sessions
    "type": "API"                 // "API" or "MANUAL"
  },
  "replication": {
    "maxConcurrentRequests": 1,
    "size": "standard"            // "standard", "large", or "xlarge"
  },
  "metadata": {
    "template": {
      "name": "template-name",                    // Required: see naming rules below
      "description": "Template description"       // Required: brief description
    },
    "tags": ["scraping", "ai"],                   // Recommended: array of tags for categorization
    "defaultJobInput": {},                        // Optional: default input for job runs
    "defaultRunPlaygroundInput": {                // Optional: default playground input
      "apiName": "api-name",
      "parameters": {}
    },
    "testAuthSessionInput": {                     // Required if authSessions.enabled = true
      "username": "demo@email.com",
      "password": "password"
    }
  }
}
```

### Metadata Section (Required)

Every template MUST have a `metadata` section with at minimum:

```jsonc
"metadata": {
  "template": {
    "name": "template-name",
    "description": "What this template does"
  }
}
```

**Template name format rules:**
- Must be **lowercase letters only**
- Use **hyphens (`-`)** instead of spaces
- Examples: `browser-use`, `e-commerce-auth`, `quick-recipes`
- **NOT:** `Browser Use`, `E-Commerce Auth`, `Quick Recipes`

**Optional metadata fields:**
- `tags`: Array of strings for categorization (recommended)
- `defaultJobInput`: Default input parameters for job runs
- `defaultRunPlaygroundInput`: Default input for playground runs (with `apiName` and `parameters`)
- `testAuthSessionInput`: Input for testing auth sessions (required if `authSessions.enabled = true`)

---

## API Files

### API Naming Convention

**API filenames must use kebab-case** (lowercase with hyphens):
- ✅ Valid: `get-user.ts`, `submit-form.py`, `extract-data.ts`
- ❌ Invalid: `getUser.ts`, `get_user.py`, `extractData.ts`
- Nested APIs follow the same convention: `api/orders/get-order.ts`

### Renaming APIs

When renaming an API file, you **MUST** update all related files:
1. **Rename the API file**: `api/{old-name}.ts` → `api/{new-name}.ts`
2. **Rename the parameters folder**: `.parameters/api/{old-name}/` → `.parameters/api/{new-name}/`
3. **Update the README**: Update any references to the old API name in the project's README.md (run commands, descriptions, etc.)

### TypeScript API

```typescript
import { BrowserContext, Page } from "playwright";

interface Params {
  // Define your parameters here
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  // Your automation code here
  return {};
}
```

### Python API

```python
from playwright.async_api import Page
from typing import TypedDict


class Params(TypedDict):
    # Define your parameters here
    pass


async def automation(page: Page, params: Params | None = None, **_kwargs):
    # Your automation code here
    return {}
```

---

## Auth Session Files (if authSessions.enabled = true)

### check.ts / check.py

Validates if the auth session is still valid. Must return `boolean`.

**TypeScript:**
```typescript
import { BrowserContext, Page } from "playwright";

export default async function check(
  page: Page,
  context: BrowserContext
): Promise<boolean> {
  // Navigate to a protected page and check if still logged in
  return true; // or false
}
```

**Python:**
```python
from playwright.async_api import Page

async def check(page: Page, **_kwargs) -> bool:
    # Navigate to a protected page and check if still logged in
    return True  # or False
```

### create.ts / create.py

Creates or recreates an auth session programmatically.

**TypeScript:**
```typescript
import { Page, BrowserContext } from "playwright";

export interface CreateAuthSessionParams {
  username: string;
  password: string;
}

export default async function* create(
  params: CreateAuthSessionParams,
  page: Page,
  context: BrowserContext
): AsyncGenerator<unknown, any, string> {
  // Perform login steps
  return true; // success
}
```

**Python:**
```python
from playwright.async_api import Page
from typing import TypedDict

class Params(TypedDict):
    username: str
    password: str

async def create(page: Page, params: Params | None = None, **_kwargs):
    # Perform login steps
    return True  # success
```

---

## .parameters Folder

Each API must have a corresponding folder in `.parameters/api/` with a `default.json` file. **The folder structure must mirror the API folder structure, including nested directories.**

```
.parameters/
├── api/                      # API parameters folder
│   └── {api-name}/           # Folder per API (matches filename without extension)
│       └── default.json      # Contains default test parameters as JSON
└── auth-sessions/            # Only if authSessions.enabled = true
    ├── check/                # Check auth session parameters
    │   └── default.json
    └── create/               # Create auth session parameters
        └── default.json
```

### Nested APIs

For nested API files, the `.parameters/` folder structure must match the `api/` folder structure:

| API File | Parameters File |
|----------|-----------------|
| `api/sample.ts` | `.parameters/api/sample/default.json` |
| `api/content-selection/css-based.py` | `.parameters/api/content-selection/css-based/default.json` |
| `api/ai/extract-structured-data.ts` | `.parameters/api/ai/extract-structured-data/default.json` |

**Example nested structure:**
```
api/
├── simple-crawl.py
├── adaptive-crawl/
│   ├── statistical.py
│   └── embedding.py
└── content-selection/
    ├── css-based.py
    └── llm-based.py

.parameters/api/
├── simple-crawl/
│   └── default.json
├── adaptive-crawl/
│   ├── statistical/
│   │   └── default.json
│   └── embedding/
│       └── default.json
└── content-selection/
    ├── css-based/
    │   └── default.json
    └── llm-based/
        └── default.json
```

**Example `.parameters/api/sample/default.json`:**
```json
{}
```

**Example `.parameters/auth-sessions/check/default.json`:**
```json
{}
```

**Example `.parameters/auth-sessions/create/default.json`:**
```json
{
  "username": "demo@email.com",
  "password": "DemoUser2024!"
}
```

---

## README.md

Each template README must follow the getting started template located at:
- TypeScript: `typescript-examples/project_getting_started_template.md`
- Python: `python-examples/project_getting_started_template.md`

### Key Requirements

1. **Always use `.parameters` paths** - Never use inline JSON like `'{}'`
   ```bash
   # Good
   uv run intuned run api sample .parameters/api/sample/default.json

   # Bad
   uv run intuned run api sample '{}'
   ```

2. **Include example for each API** in the Run an API section

3. **Update Project Structure** to match actual files

4. **Use `Intuned.jsonc`** not `intuned.json` in documentation

---

## Package Files

### TypeScript (package.json)

```json
{
  "name": "template-name",
  "version": "1.0.0",
  "description": "Template description",
  "scripts": {
    "intuned": "intuned"
  },
  "dependencies": {
    "@intuned/browser": "0.1.6",
    "@intuned/runtime": "1.3.12",
    "@types/node": "^20.10.3",
    "playwright": "~1.56.0"
  }
}
```

### Python (pyproject.toml)

```toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "template-name"
version = "0.0.1"
description = "Template description"
authors = [{ name = "Intuned", email = "service@intunedhq.com" }]
requires-python = ">=3.12,<3.13"
readme = "README.md"
keywords = ["Python", "intuned-browser-sdk"]
dependencies = [
    "playwright==1.56",
    "intuned-runtime==1.3.12",
    "intuned-browser==0.1.9",
]

[tool.uv]
package = false
```

---

## Environment Variables

### .env.example

```
INTUNED_API_KEY=your_api_key_here
```

---

## AI Gateway (for AI-powered templates)

If your template uses AI (LLM calls), use the Intuned AI Gateway instead of requiring users to provide API keys:

**TypeScript:**
```typescript
import { getAiGatewayConfig } from '@intuned/runtime';
const { baseUrl, apiKey } = await getAiGatewayConfig();
```

**Python:**
```python
from intuned_runtime import intuned_runtime
config = await get_ai_gateway_config()
base_url = config.base_url
api_key = config.api_key
```

---

## Checklist for New Templates

### Intuned.jsonc
- [ ] No `workspaceId` field (should not be committed)
- [ ] `metadata.template.name` is set (lowercase with hyphens, no spaces)
- [ ] `metadata.template.description` is set
- [ ] `metadata.tags` is set (recommended)
- [ ] `apiAccess.enabled` is explicitly set
- [ ] `testAuthSessionInput` is set if auth sessions are enabled

### API Files
- [ ] All API filenames use kebab-case (e.g., `get-user.ts`, not `getUser.ts`)

### .parameters Folder
- [ ] `.parameters/api/` folder exists
- [ ] `.parameters/api/{api-name}/default.json` exists for each API (including nested APIs matching the `api/` folder structure)
- [ ] `.parameters/auth-sessions/check/default.json` exists if auth sessions are enabled
- [ ] `.parameters/auth-sessions/create/default.json` exists if auth sessions are enabled

### Auth Sessions (if enabled)
- [ ] `auth-sessions/check.ts` or `check.py` exists
- [ ] `auth-sessions/create.ts` or `create.py` exists
- [ ] `auth-sessions-instances/test-auth-session/` exists with valid session

### README
- [ ] Follows the getting started template
- [ ] Uses `.parameters/api/` paths, not inline JSON
- [ ] Project structure matches actual files
- [ ] Uses `Intuned.jsonc` not `intuned.json`
- [ ] All commands are tested and working
