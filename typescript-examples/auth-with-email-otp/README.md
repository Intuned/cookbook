# auth-with-email-otp (TypeScript)

Authentication example using email-based OTP verification with Resend.

<!-- IDE-IGNORE-START -->

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/auth-with-email-otp" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>

<!-- IDE-IGNORE-END -->

## APIs

| API | Description |
| --- | ----------- |
| `list-contracts` | Lists contracts for the authenticated user from the sandbox site |

<!-- IDE-IGNORE-START -->

## Getting Started

### Prerequisites

This project uses [Resend](https://resend.com) for email-based OTP retrieval. You'll need a Resend account with the **Receiving Emails** inbox set up.

#### Set up a Resend Receiving Email inbox

1. In the Resend dashboard, go to **Receiving Emails** in the left sidebar
2. Click **Add Inbox** — Resend will auto-assign a subdomain and give you a wildcard address like `*@ostokcen.resend.app`
3. Note your inbox address shown in the dashboard

> **Wildcard inbox**: Any email sent to `anything@yoursubdomain.resend.app` lands in the same inbox. This is useful for creating multiple auth sessions — use a different local part each time (e.g. `otp1@...`, `otp2@...`).

#### Get a Resend API key

1. In the Resend dashboard, go to **API Keys**
2. Click **Create API key** with full access (or at least "Receiving access")
3. Set the environment variable:

```bash
export RESEND_API_KEY=your-resend-api-key
```

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

### Run an API

```bash
intuned dev run api list-contracts .parameters/api/list-contracts/default.json --auth-session test-auth-session
```

### Auth Sessions

Edit `.parameters/auth-sessions/create/default.json` to set your Resend inbox email as the username:

```json
{
  "username": "otp@yoursubdomain.resend.app"
}
```

> **Important — each email can only register once**: The sandbox site is a signup flow, so each email address can only be used one time. To create another auth session, use a different local part — e.g. `otp2@yoursubdomain.resend.app`.

```bash
# Create
intuned dev run authsession create .parameters/auth-sessions/create/default.json

# Validate
intuned dev run authsession validate test-auth-session

# Update
intuned dev run authsession update test-auth-session
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
/
├── api/
│   └── list-contracts.ts                              # Lists contracts for the authenticated user
├── auth-sessions/
│   ├── check.ts                                       # Validates if the auth session is still active
│   └── create.ts                                      # Signs up and verifies OTP to create the auth session
├── auth-sessions-instances/
│   └── test-auth-session/                             # Example local auth session
│       ├── auth-session.json                          # Saved browser state (cookies, localStorage)
│       └── metadata.json                              # Auth session metadata
├── utils/
│   ├── resend.ts                                      # Resend API integration for email OTP retrieval
│   └── typesAndSchemas.ts                             # Type definitions and Zod validation schemas
├── intuned-resources/
│   ├── jobs/
│   │   └── list-contracts.job.jsonc                   # Job configuration for list-contracts
│   └── auth-sessions/
│       └── test-auth-session.auth-session.jsonc       # Auth session resource configuration
├── .parameters/
│   ├── api/list-contracts/                            # Parameters for the list-contracts API
│   └── auth-sessions/                                 # Parameters for auth session operations
├── Intuned.jsonc                                      # Intuned project configuration
└── package.json                                       # Node.js project dependencies
```

## Environment Variables

| Variable | Description |
| --- | --- |
| `RESEND_API_KEY` | Your Resend API key — required for reading OTP emails from the Resend inbox |

## Related

- [Intuned CLI](https://docs.intunedhq.com/docs/05-references/cli/overview)
- [Auth Sessions](https://docs.intunedhq.com/docs/02-features/auth-sessions)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [Intuned In-Depth](https://docs.intunedhq.com/docs/01-learn/deep-dives/intuned-indepth)
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
