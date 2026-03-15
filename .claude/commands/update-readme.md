---
description: Create/Update Readme file for the project
argument-hint: Short feature description
allowed-tools: Read, Write, Edit, Glob
---
# Context

Update the README.md for the project at $ARGUMENTS to match the current standard structure. If no path is given, use the project in the current working directory.

## Steps

1. **Read the project** — read the following files to understand the project:
   - `README.md` (existing, if any)
   - `Intuned.jsonc` — to determine language (TypeScript vs Python), auth sessions enabled, template name/description
   - All files in `api/` — to get API names and understand what each one does
   - `.parameters/api/` — to get the default parameter file path for each API
   - `auth-sessions/` — if it exists, note the auth session files
   - `intuned-resources/` — if it exists, note job/auth-session resource files

2. **Detect language** — check if the project has `package.json` (TypeScript) or `pyproject.toml` (Python).

3. **Rewrite README.md** using the structure below. Do not preserve old outdated content; rewrite from scratch following this exact structure.

---

## README Structure

### Title

Use the template name from `Intuned.jsonc` `metadata.template.name`, suffixed with the language in parentheses:

```
# <Template Name> (TypeScript)
# <Template Name> (Python)
```

### Description

One sentence from `metadata.template.description`.

### Run on Intuned button

For TypeScript:

```html
<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/<folder-name>" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>
```

For Python:

```html
<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/<folder-name>" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>
```

Derive `<folder-name>` from the directory name of the project.

### APIs table

```markdown
## APIs

| API | Description |
| --- | ----------- |
| `<api-name>` | <one-line description of what the API does> |
```

One row per API file found in `api/`. Derive descriptions from reading the API source files.

### Getting started

#### Install dependencies

**TypeScript:**

```markdown
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

```

**Python:**
```markdown
### Install dependencies

```bash
uv sync
```

If the `intuned` CLI is not installed, install it globally:

```bash
npm install -g @intuned/cli
```

After installing dependencies, `intuned` command should be available in your environment.

```

#### Run an API

Use `intuned dev run api` (not `uv run intuned` or `yarn intuned`). Include one command per API:

```markdown
### Run an API

```bash
intuned dev run api <api-name> .parameters/api/<api-name>/default.json
```

```

If auth sessions are enabled (`authSessions.enabled: true` in `Intuned.jsonc`), add an auth session variant:

```markdown
#### Run an API with an Auth Session

```bash
intuned dev run api <api-name> .parameters/api/<api-name>/default.json --auth-session <auth-session-id>
```

```

#### Auth Sessions section (only if `authSessions.enabled: true`)

```markdown
### Auth Sessions

```bash
# Create
intuned dev run authsession create .parameters/auth-sessions/create/default.json

# Validate
intuned dev run authsession validate <auth-session-id>

# Update
intuned dev run authsession update <auth-session-id>
```

```

#### Save project

```markdown
### Save project

```bash
intuned dev provision
```

```

> Note: `intuned dev provision` requires `projectName` to be set in `Intuned.jsonc`. The current files already have the commented placeholder — mention this if relevant.

#### Deploy

```markdown
### Deploy

```bash
intuned dev deploy
```

```

### Project structure

Reflect the **actual** files and folders in the project. Use `tree`-style formatting. Include:
- `api/` with each API file and a short inline comment
- `hooks/` if present
- `utils/` if present
- `auth-sessions/` if present
- `auth-sessions-instances/` if present
- `intuned-resources/` if present (with `jobs/` and/or `auth-sessions/` subfolders)
- `.parameters/api/` — just the folder, no need to list files
- `Intuned.jsonc`
- `package.json` (TypeScript) or `pyproject.toml` (Python)
- `README.md`

### Related links

Always include:
```markdown
## Related

- [Intuned CLI](https://docs.intunedhq.com/docs/05-references/cli/overview)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
```

If the project uses auth sessions, also add:

```markdown
- [Auth Sessions](https://docs.intunedhq.com/docs/02-features/auth-sessions)
```

---

## Rules

- Use `intuned dev` for ALL CLI commands — never `uv run intuned`, `yarn intuned`, or `npm run intuned`
- Always use `.parameters/api/<api-name>/default.json` paths — never inline JSON like `'{}'`
- Always use `Intuned.jsonc` not `intuned.json`
- Do not include sections that don't apply (e.g. no Auth Sessions section if auth is disabled)
- Do not include environment variable sections unless the project actually uses env vars
- Keep the README concise — no filler paragraphs, no "Getting Started" preamble docs links
- Keep any information that will help while updating the rest of sections to align with the template
- Keep the references in the Related parts while adding the new ones
- Do Not remove ide ignore