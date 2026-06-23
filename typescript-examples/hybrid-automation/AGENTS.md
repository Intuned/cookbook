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

## Running APIs Locally

```bash
intuned dev run api <api-name> .parameters/api/<api-name>/default.json            # Run an API locally
intuned dev run api <api-name> .parameters/api/<api-name>/default.json --auth-session <id>  # With a pre-authenticated session
```

→ [CLI Dev Reference](https://intunedhq.com/docs/main/05-references/cli/dev.md)

---

## Runs

A Run is a single on-demand execution of an API on the deployed platform. Use runs to trigger automations manually without setting up a job.

```bash
intuned platform runs start <data>   # Start a new run
intuned platform runs list           # List runs for the project
intuned platform runs get <run-id>   # Get run details
```

→ [Runs docs](https://intunedhq.com/docs/main/02-features/runs-single-executions.md)

---

## Jobs

There are two types of jobs:
- **Job as Code** — defined in `intuned-resources/jobs/` and deployed with the project
- **Platform Jobs** — managed via the Intuned dashboard or CLI

```bash
intuned platform jobs list                      # List all jobs in the project
intuned platform jobs trigger <job-id>          # Manually trigger a job run
intuned platform jobs pause <job-id>            # Pause a scheduled job
intuned platform jobs resume <job-id>           # Resume a paused job
intuned platform jobs get <job-id>              # Get job details and config
intuned platform jobruns list <job-id>          # List all runs for a job
intuned platform jobruns get <job-run-id>       # Get details of a specific job run
intuned platform jobruns terminate <job-run-id> # Stop a running job run
```

→ [Jobs docs](https://intunedhq.com/docs/main/02-features/jobs-batched-executions.md)

---

## Keep the CLI Up to Date

Always ensure the Intuned CLI is on the latest version before running commands:

```bash
npm install -g @intuned/cli
intuned --version
```

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
