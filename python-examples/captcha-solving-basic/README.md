# Captcha Solving Basic (Python)

Basic captcha solving with support for reCAPTCHA, Cloudflare, and custom captchas.

## Run on Intuned

Open this project in Intuned by clicking the button below.

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/captcha-solving-basic" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>

## APIs

| API | Description |
| --- | ----------- |
| `captcha-solver` | Solves reCAPTCHA v2, Cloudflare Turnstile, GeeTest, and custom captchas |

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

- [Intuned CLI](https://docs.intunedhq.com/docs/05-references/cli/overview)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
