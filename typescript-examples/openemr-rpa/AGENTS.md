# Intuned Project — Agent Guide

## Always Refer to the Docs

**Before implementing anything**, read the relevant documentation. The docs are the source of truth — don't guess at APIs, config fields, or CLI flags.

- [Introduction](https://intunedhq.com/docs/main/00-getting-started/introduction.md)
- [Intuned In-Depth](https://intunedhq.com/docs/main/01-learn/deep-dives/intuned-indepth.md)
- [Auth Sessions](https://intunedhq.com/docs/main/02-features/auth-sessions.md)
- [Runs (Standalone)](https://intunedhq.com/docs/main/02-features/runs-single-executions.md)
- [Jobs](https://intunedhq.com/docs/main/02-features/jobs-batched-executions.md)
- [CLI Dev Reference](https://intunedhq.com/docs/main/05-references/cli/dev.md)
- [CLI Platform Reference](https://intunedhq.com/docs/main/05-references/cli/platform.md)
- [Full docs index](https://intunedhq.com/docs/llms.txt)

---

## What is Intuned?

Intuned is a code-first browser automation platform. You write Python or TypeScript code that controls a browser, and Intuned handles deployment, scheduling, auth, monitoring, and execution.

---

## Core Concepts

**Project** — The unit of deployment. Configured via `Intuned.jsonc`. Contains your API files, auth sessions, and jobs.

**APIs** — Individual automation functions in the `api/` folder. Each accepts a browser page + parameters and returns a result. Filenames must be kebab-case (e.g. `get-products.py`).

**Runs** — A single on-demand execution of an API. Triggered manually via CLI or the dashboard.

**Jobs** — Batch/scheduled execution of APIs. Configured in `intuned-resources/jobs/`. Support concurrency, retries, scheduling, and result sinks.

**Auth Sessions** — Managed login state. When `authSessions.enabled: true` in `Intuned.jsonc`, APIs receive a pre-authenticated browser session.

---

## Intuned CLI

The CLI is the main way to interact with Intuned — use it to develop and test locally, deploy projects, and manage all platform resources.

Always keep it up to date before running any commands:

```bash
npm install -g @intuned/cli   # Install or update to latest
intuned --version             # Check current version
```

The CLI has two main groups:

**`intuned dev`** — local development
- `run` — run and test APIs locally
- `deploy` / `provision` — deploy projects to the platform
- `init` — initialize new projects from templates
- `test-job` — run test jobs locally

**`intuned platform`** — manage deployed resources
- `runs` — trigger and monitor standalone runs
- `jobs` / `jobruns` — manage jobs and their runs
- `authsessions` — manage auth sessions on the platform
- `env-vars` — manage project environment variables
- `issues` — view and manage project issues

→ [CLI Dev Reference](https://intunedhq.com/docs/main/05-references/cli/dev.md)
→ [CLI Platform Reference](https://intunedhq.com/docs/main/05-references/cli/platform.md)

---

## Running APIs Locally

```bash
intuned dev run api <api-name> .parameters/api/<api-name>/default.json            # Run an API locally
intuned dev run api <api-name> .parameters/api/<api-name>/default.json --auth-session <id>  # With a pre-authenticated session
```

---

## Runs

A Run is a single on-demand execution of an API on the deployed platform. Use runs to trigger automations manually without setting up a job.

```bash
intuned platform runs --help   # See all available subcommands
```

→ [Runs docs](https://intunedhq.com/docs/main/02-features/runs-single-executions.md)

---

## Jobs

There are two types of jobs:
- **Job as Code** — defined in `intuned-resources/jobs/` and deployed with the project
- **Platform Jobs** — managed via the Intuned dashboard or CLI

```bash
intuned platform jobs --help      # See all job subcommands
intuned platform jobruns --help   # See all job run subcommands
```

→ [Jobs docs](https://intunedhq.com/docs/main/02-features/jobs-batched-executions.md)

---

## Intuned Agent Plugin

The **Intuned agent plugin** adds skills for creating scrapers, editing projects, adding APIs, configuring jobs, and more. It makes almost every task easier.

When the user asks to create or edit anything (new project, API, job, auth session, etc.), check if the plugin is installed first:
```bash
claude plugin list
```
If `intuned-agent-plugin` does not appear, ask the user:

> "The Intuned plugin isn't installed — it adds specialized skills for working with Intuned projects and would make this much more reliable. Want me to install it?"

If yes, install it:
```bash
claude plugin marketplace add Intuned/skills
claude plugin install intuned-agent-plugin@intuned-skills
```
Then ask the user to reload Claude Code to activate.

> Always ask before installing. Don't install silently.
