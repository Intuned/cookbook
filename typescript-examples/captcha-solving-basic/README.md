# captcha-solving-basic (TypeScript)

Basic captcha solving with support for reCAPTCHA, Cloudflare, and custom captchas

<!-- IDE-IGNORE-START -->
## Run on Intuned

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/captcha-solving-basic" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>
<!-- IDE-IGNORE-END -->

## APIs

| API | Description |
| --- | ----------- |
| `captcha-solver` | Demonstrates solving various captcha types including reCAPTCHA v2, Cloudflare, and custom image captchas |

<!-- IDE-IGNORE-START -->
## Getting started

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
intuned dev run api captcha-solver .parameters/api/captcha-solver/default.json
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

## Project structure

```text
/
├── api/
│   └── captcha-solver.ts
├── helpers/
│   └── captcha.ts
├── intuned-resources/
│   └── jobs/
│       └── captcha-solver.job.jsonc
├── .parameters/api/          # Test parameters
├── Intuned.jsonc             # Project config
├── package.json              # Node.js dependencies
└── README.md
```

## Related

- [Intuned CLI](https://intunedhq.com/docs/main/05-references/cli/overview)
- [Intuned Browser SDK](https://intunedhq.com/docs/automation-sdks/overview)
- [Intuned llm.txt](https://intunedhq.com/docs/llms.txt)
