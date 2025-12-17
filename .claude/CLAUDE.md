# Intuned Cookbook

This is a cookbook repository with TypeScript and Python examples for the Intuned browser automation platform.

## Project Structure

- `typescript-examples/` - TypeScript examples (17 projects)
- `python-examples/` - Python examples (19 projects)
- Each example is a self-contained project with its own dependencies

## File Conventions

- Use `Intuned.jsonc` (not `Intuned.json`) for Intuned project configuration files

## Intuned.jsonc Metadata

Each project's `Intuned.jsonc` must include a `metadata` section with the following fields:

```jsonc
{
  // ... other config ...
  "metadata": {
    "defaultJobInput": {},           // Optional: default input for job runs
    "defaultRunPlaygroundInput": {}, // Optional: default input for playground runs
    "testAuthSessionInput": {},      // Optional: input for testing auth sessions
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

For projects that use AI (e.g., browser-use, SDK templates with LLM calls):

**Use `getAiGatewayConfig` from Intuned runtime** - do NOT ask users for Anthropic/OpenAI API keys.

```typescript
// TypeScript
import { getAiGatewayConfig } from '@intuned/runtime';
const { baseUrl, apiKey } = await getAiGatewayConfig();
```

```python
# Python (snake_case)
from runtime_helpers import get_ai_gateway_config
config = await get_ai_gateway_config()
base_url = config.base_url
api_key = config.api_key
```

**Key points:**
- This provides a temporary AI gateway with `baseUrl`/`base_url` and `apiKey`/`api_key`
- Templates should use this gateway instead of requiring users to provide their own AI provider keys
- Applies to: browser-use templates, any template making LLM API calls

**Review checklist for Intuned.jsonc:**
- [ ] `metadata.template.name` is set
- [ ] `metadata.template.description` is set
- [ ] `metadata.defaultJobInput` set if project has APIs with inputs
- [ ] `metadata.defaultRunPlaygroundInput` set if needed
- [ ] `metadata.testAuthSessionInput` set if project uses auth sessions
- [ ] `apiAccess` is explicitly set (ask user for preference on new templates)

## Project README Template

Each project README must include the "Getting Started" template from:
- TypeScript: `typescript-examples/project_getting_started_template.md.md`
- Python: `python-examples/project_getting_started_template.md.md`

**When adding template to a project README, follow these markdown comments in the template:**

1. **Run an API section**: Replace `<api-name>` and `<parameters>` with actual values. Include an example command for EACH API in the project, using the `.parameters` folder JSON files as examples.

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
├── {api-name}/           # Folder for each API (matches api filename without extension)
│   └── default.json      # Default parameters JSON
├── auth/                 # Auth session parameters (if project uses auth sessions)
│   ├── check.json        # Parameters for auth/check API
│   └── create.json       # Parameters for auth/create API
```

**Requirements:**
- Create a folder for each API in `apis/` directory
- Include `auth/check.json` and `auth/create.json` if project has `auth-sessions/` folder
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
