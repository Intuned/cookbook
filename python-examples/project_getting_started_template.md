## Getting Started

To get started developing browser automation projects with Intuned, check out the 
- Intuned docs [here](https://docs.intunedhq.com/docs/00-getting-started/introduction)
- CLI docs [here](https://docs.intunedhq.com/docs/05-references/cli)
- Intuned.jsonc docs [here](https://docs.intunedhq.com/docs/05-references/intuned-json#intuned-json)


## Development

> **_NOTE:_**  All commands support `--help` flag to get more information about the command and its arguments and options.

### Install dependencies
```bash
uv sync
```

After installing dependencies, `intuned` command should be available in your environment.

<!-- You should replace the api-name and path of the json parameter to run with inside .parameters folder -->
<!-- You should also Include an example for all the apis on Run ap API -->
### Run an API
```bash
uv run intuned run api <api-name> <parameters>
```

<!-- Only if auth is enabled in Intuned.jsonc -->
## Auth Sessions

This project uses Intuned Auth Sessions. To learn more, check out the [Authenticated Browser Automations: Conceptual Guide](https://docs.intunedhq.com/docs/getting-started/conceptual-guides/authenticated-browser-automations-conceptual-guide).

<!-- You should replace <parameters> with path of the json parameter to run with inside .parameters folder for auth it's under .parameters/auth -->
### Create a new auth session
```bash
uv run intuned run authsession create <parameters>
```

### Update an existing auth session
```bash
uv run intuned run authsession update <auth-session-id>
```

### Validate an auth session
```bash
uv run intuned run authsession validate <auth-session-id>
```


### Deploy project
```bash
uv run intuned deploy
```

### `intuned-browser`: Intuned Browser SDK

This project uses Intuned browser SDK. For more information, check out the [Intuned Browser SDK documentation](https://docs.intunedhq.com/automation-sdks/overview).


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

