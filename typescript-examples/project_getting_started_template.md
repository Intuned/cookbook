## Getting Started

To get started developing browser automation projects with Intuned, check out the 
- Intuned docs [here](https://docs.intunedhq.com/docs/00-getting-started/introduction)
- CLI docs [here](https://docs.intunedhq.com/docs/05-references/cli)
- Intuned.jsonc docs [here](https://docs.intunedhq.com/docs/05-references/intuned-json#intuned-json)

## Development

> **_NOTE:_**  All commands support `--help` flag to get more information about the command and its arguments and options.

### Install dependencies
```bash
# npm
npm install

# yarn
yarn
```

> **_NOTE:_**  If you are using `npm`, make sure to pass `--` when using options with the `intuned` command.

<!-- You should replace the api-name and path of the json parameter to run with inside .parameters folder -->
<!-- You should also Include an example for all the apis on Run ap API -->
<!-- For templates with enabled AuthSessions we need to also link the auth session id in the run  -->
### Run an API

```bash
# npm
npm run intuned run api <api-name> <parameters>

# yarn
yarn intuned run api <api-name> <parameters>
```

<!-- Only if auth is enabled in Intuned.jsonc -->
#### Run an API with Auth Session

When AuthSessions are enabled, APIs require an AuthSession ID to run:

```bash
# npm (note the -- separator before flags)
npm run intuned -- run api <api-name> <parameters> --auth-session <auth-session-id>

# yarn
yarn intuned run api <api-name> <parameters> --auth-session <auth-session-id>
```

### Save project

```bash
# npm
npm run intuned run save

# yarn
yarn intuned run save
```

Reference for saving project [here](https://docs.intunedhq.com/docs/02-features/local-development-cli#use-runtime-sdk-and-browser-sdk-helpers)

<!-- Only if auth is enabled in Intuned.jsonc -->
## Auth Sessions

This project uses Intuned Auth Sessions. To learn more, check out the [Authenticated Browser Automations: Conceptual Guide](https://docs.intunedhq.com/docs/getting-started/conceptual-guides/authenticated-browser-automations-conceptual-guide).

<!-- You should replace <parameters> with path of the json parameter to run with inside .parameters folder for auth it's under .parameters/auth-sessions/create/default.json -->
### Create a new auth session
```bash
# npm
npm run intuned run authsession create <parameters>

# yarn
yarn intuned run authsession create <parameters>
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

### Deploy project
```bash
# npm
npm run intuned deploy

# yarn
yarn intuned deploy

```


### `@intuned/browser`: Intuned Browser SDK

This project uses Intuned browser SDK. For more information, check out the [Intuned Browser SDK documentation](https://docs.intunedhq.com/automation-sdks/overview).



<!-- This should always match the project structure the readme is in -->
## Project Structure
The project structure is as follows:
```
/
├── apis/                     # Your API endpoints 
│   └── ...   
├── auth-sessions/            # Auth session related APIs
│   ├── check.ts           # API to check if the auth session is still valid
│   └── create.ts          # API to create/recreate the auth session programmatically
├── auth-sessions-instances/  # Auth session instances created and used by the CLI
│   └── ...
└── intuned.json              # Intuned project configuration file
```

## Envs
<!-- Here you should mention all the do -->

