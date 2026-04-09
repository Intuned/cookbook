## Getting Started

To get started developing browser automation projects with Intuned, check out the

- Intuned docs [here](https://intunedhq.com/docs/main/00-getting-started/introduction)
- CLI docs [here](https://intunedhq.com/docs/main/05-references/cli)
- Intuned.jsonc docs [here](https://intunedhq.com/docs/main/05-references/intuned-json#intuned-json)

## Development

> **_NOTE:_**  All commands support `--help` flag to get more information about the command and its arguments and options.

### Install dependencies

```bash
uv sync
```

If the `intuned` CLI is not installed, install it globally:

```bash
npm install -g @intuned/cli
```

After installing dependencies, `intuned` command should be available in your environment.

<!-- You should replace the api-name and path of the json parameter to run with inside .parameters folder -->
<!-- You should also Include an example for all the apis on Run ap API -->
<!-- For templates with enabled AuthSessions we need to also link the auth session id in the run  -->
### Run an API

```bash
intuned dev run api <api-name> <parameters>
```

<!-- Only if auth is enabled in Intuned.jsonc -->
#### Run an API with Auth Session

When AuthSessions are enabled, APIs require an AuthSession ID to run:

```bash
intuned dev run api <api-name> <parameters> --auth-session <auth-session-id>
```

### Save project

```bash
intuned dev provision
```

Reference for saving project [here](https://intunedhq.com/docs/main/02-features/local-development-cli#use-runtime-sdk-and-browser-sdk-helpers)

<!-- Only if auth is enabled in Intuned.jsonc -->
## Auth Sessions

This project uses Intuned Auth Sessions. To learn more, check out the [AuthSessions](https://intunedhq.com/docs/main/02-features/auth-sessions).

<!-- You should replace <parameters> with path of the json parameter to run with inside .parameters folder for auth it's under .parameters/auth-sessions/create/default.json -->
### Create a new auth session

```bash
intuned dev run authsession create <parameters>
```

### Update an existing auth session

```bash
intuned dev run authsession update <auth-session-id>
```

### Validate an auth session

```bash
intuned dev run authsession validate <auth-session-id>
```

### Deploy project

```bash
intuned dev deploy
```

### `intuned-browser`: Intuned Browser SDK

This project uses Intuned browser SDK. For more information, check out the [Intuned Browser SDK documentation](https://intunedhq.com/docs/automation-sdks/overview).

<!-- This should always match the project structure the readme is in -->
## Project Structure

The project structure is as follows:

```
/
├── apis/                     # Your API endpoints 
│   └── ...   
├── auth-sessions/            # Auth session related APIs
│   ├── check.py           # API to check if the auth session is still valid
│   └── create.py          # API to create/recreate the auth session programmatically
├── auth-sessions-instances/  # Auth session instances created and used by the CLI
│   └── ...
└── intuned.jsonc              # Intuned project configuration file
```

## Envs
<!-- Here you should mention all the do -->
