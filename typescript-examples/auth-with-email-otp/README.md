# Auth with Email OTP

Authentication automation with email-based OTP verification using Resend for email inbox access.

<!-- IDE-IGNORE-START -->
## Run on Intuned

[![Run on Intuned](https://cdn1.intuned.io/button.svg)](https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/auth-with-email-otp)

## Getting Started

To get started developing browser automation projects with Intuned, check out our [Quick Starts Guide](https://docs.intunedhq.com/docs/00-getting-started/quickstarts).

## Development

> **_NOTE:_** All commands support `--help` flag to get more information about the command and its arguments and options.

### Prerequisites

**Important:** This example uses [Resend](https://resend.com) for email-based OTP verification. You'll need:

1. **Resend Account** - Sign up at [resend.com](https://resend.com) to get an API key
2. **Resend API Key** - Generate an API key from your Resend dashboard
3. **Set Environment Variable**:
   ```bash
   export RESEND_API_KEY=your-resend-api-key
   ```

### Install dependencies

```bash
# npm
npm install

# yarn
yarn
```

> **_NOTE:_** If you are using `npm`, make sure to pass `--` when using options with the `intuned` command.

After installing dependencies, `intuned` command should be available in your environment.

### Deploy project

```bash
# npm
npm run intuned deploy

# yarn
yarn intuned deploy

```

## Auth Sessions

This project uses Intuned Auth Sessions. To learn more, check out the [AuthSessions](https://docs.intunedhq.com/docs/02-features/auth-sessions).  

### Create a new auth session

```bash
# npm
npm run intuned run authsession create .parameters/auth-sessions/create/default.json

# yarn
yarn intuned run authsession create .parameters/auth-sessions/create/default.json
```

### Update an existing auth session

```bash
# npm
npm run intuned run authsession update <auth-session-id>

# yarn
yarn intuned run authsession update <auth-session-id>
```

### Validate an auth session

```bash
# npm
npm run intuned run authsession validate <auth-session-id>

# yarn
yarn intuned run authsession validate <auth-session-id>
```

### Run an API

```bash
# npm
npm run intuned run api list-contracts .parameters/api/list-contracts/default.json --auth-session test-auth-session

# yarn
yarn intuned run api list-contracts .parameters/api/list-contracts/default.json --auth-session test-auth-session
```

### `@intuned/browser`: Intuned Browser SDK

This project uses Intuned browser SDK. For more information, check out the [Intuned Browser SDK documentation](https://docs.intunedhq.com/automation-sdks/overview).

<!-- IDE-IGNORE-END -->

## Project Structure

```
/
├── api/                          # API endpoints
│   └── list-contracts.ts         # List contracts for authenticated user
├── auth-sessions/                # Auth session related APIs
│   ├── check.ts                  # API to check if the auth session is still valid
│   └── create.ts                 # API to create/recreate the auth session programmatically
├── auth-sessions-instances/      # Auth session instances created and used by the CLI
│   └── test-auth-session/        # Example test auth session
│       ├── auth-session.json     # Browser state (cookies, localStorage)
│       └── metadata.json         # Auth session metadata
├── utils/                        # Utility modules
│   ├── resend.ts                 # Resend API integration for email OTP
│   └── types-and-schemas.ts      # Type definitions and schemas
├── .parameters/                  # Test parameters for APIs
│   ├── api/                      # API parameters folder
│   │   └── list-contracts/
│   │       └── default.json
│   └── auth-sessions/            # Auth session parameters
│       ├── check/
│       │   └── default.json
│       └── create/
│           └── default.json
├── Intuned.jsonc                 # Intuned project configuration file
├── package.json                  # Node.js project dependencies
└── tsconfig.json                 # TypeScript configuration
```

## Environment Variables

This project requires the following environment variables:

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | Your Resend API key from [resend.com](https://resend.com) - Required for OTP email retrieval |

## Learn More

- [Auth Sessions Documentation](https://docs.intunedhq.com/docs/02-features/auth-sessions)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [Intuned In-Depth](https://docs.intunedhq.com/docs/01-learn/deep-dives/intuned-indepth)
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
