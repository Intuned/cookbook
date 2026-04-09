# Captcha Solving Basic (Python)

Basic captcha solving with support for reCAPTCHA, Cloudflare, and custom captchas.

<!-- IDE-IGNORE-START -->
## Run on Intuned

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/captcha-solving-basic" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>
<!-- IDE-IGNORE-END -->

## APIs

| API | Description |
| --- | ----------- |
| `captcha-solver` | Solves reCAPTCHA v2, Cloudflare Turnstile, GeeTest, and custom captchas |

<!-- IDE-IGNORE-START -->
## Getting started

### Install dependencies

```bash
uv sync
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
│   └── captcha-solver.py             # Solves multiple captcha types (reCAPTCHA, Cloudflare, GeeTest, custom)
├── helpers/
│   └── captcha.py                    # go_to_with_captcha_solve helper
├── intuned-resources/
│   └── jobs/
│       └── captcha-solver.job.jsonc  # Job definition
├── .parameters/api/                  # Test parameters
├── Intuned.jsonc                     # Project config
├── pyproject.toml                    # Python dependencies
└── README.md
```

## Related

- [Intuned CLI](https://intunedhq.com/docs/main/05-references/cli/overview)
- [Intuned Browser SDK](https://intunedhq.com/docs/automation-sdks/overview)
- [Intuned llm.txt](https://intunedhq.com/docs/llms.txt)
