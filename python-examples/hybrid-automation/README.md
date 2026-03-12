# Hybrid Automation

Flexible automation combining the [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview) with AI-powered tools like [Stagehand](https://docs.stagehand.dev/) and `extract_structured_data` for speed, reliability, and adaptability.

## Key Features

- **Best of Both Worlds**: Combines fast, reliable SDK automation with AI adaptability
- **Smart Fallbacks**: Uses deterministic methods first, falls back to AI when needed
- **Three Use Cases**: RPA form filling, e-commerce scraping, and job board crawling
- **Production Ready**: Cost-effective primary path with AI safety net for edge cases

## Why Hybrid?

| Approach | Pros | Cons |
| ---------- | ------ | ------ |
| **Deterministic (Intuned Browser SDK)** | Fast, reliable, cost-effective | Breaks when site structure changes |
| **AI-Driven (Stagehand, extract_structured_data)** | Adapts to layout changes | Slower, less predictable |
| **Hybrid (This example)** | Best of both worlds | Slightly more complex |

The hybrid pattern: Use Intuned Browser SDK first (fast path), fall back to AI tools when needed.

Learn more: [Flexible Automations](https://docs.intunedhq.com/docs/02-features/flexible-automation)

## `intuned-browser`: Intuned Browser SDK

This project uses Intuned browser SDK. For more information, check out the [Intuned Browser SDK documentation](https://docs.intunedhq.com/automation-sdks/overview).

<!-- IDE-IGNORE-START -->
## Run on Intuned

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/hybrid-automation" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>

## Getting Started

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
intuned dev run api rpa/fill-form .parameters/api/rpa/fill-form/default.json
intuned dev run api scraper/list .parameters/api/scraper/list/default.json
intuned dev run api scraper/details .parameters/api/scraper/details/default.json
intuned dev run api crawler/crawl .parameters/api/crawler/crawl/default.json
intuned dev run api crawler/crawl .parameters/api/crawler/crawl/job-posting.json
intuned dev run api crawler/crawl .parameters/api/crawler/crawl/not-lever.json
```

### Save project

```bash
intuned dev provision
```

### Deploy project

```bash
intuned dev deploy
```

<!-- IDE-IGNORE-END -->

## Project Structure

```text
/
├── .parameters/                  # Test parameters for APIs
│   └── api/
│       ├── rpa/
│       │   └── fill-form/
│       │       └── default.json
│       ├── scraper/
│       │   ├── list/
│       │   │   └── default.json
│       │   └── details/
│       │       ├── default.json
│       │       └── example2.json
│       └── crawler/
│           └── crawl/
│               ├── default.json
│               ├── job-posting.json
│               └── not-lever.json
├── api/                          # API endpoints
│   ├── rpa/
│   │   └── fill-form.py          # Form filling with Stagehand fallback
│   ├── scraper/
│   │   ├── list.py               # Product list with pagination
│   │   └── details.py            # Product details with AI extraction
│   └── crawler/
│       └── crawl.py              # Job board crawler (hybrid extraction)
├── hooks/
│   └── setup_context.py          # CDP URL setup for Stagehand
├── utils/
│   └── crawler/                  # Crawler utilities
├── intuned-resources/
│   └── jobs/
│       ├── rpa/
│       │   └── fill-form.job.jsonc      # Job for RPA form filling
│       ├── scraper/
│       │   ├── list.job.jsonc           # Job for product list scraping
│       │   └── details.job.jsonc        # Job for product details
│       └── crawler/
│           └── crawl.job.jsonc          # Job for job board crawling
├── Intuned.jsonc                 # Intuned project configuration
└── pyproject.toml                # Python project dependencies
```

## APIs

| API | Description |
| ----- | ------------- |
| `rpa/fill-form` | RPA automation that fills consultation booking forms. Uses Playwright via Intuned Browser SDK for form fields, falls back to `stagehand.page.act()` if selectors fail. Verifies success with Playwright, falls back to `stagehand.page.extract()` |
| `scraper/list` | E-commerce product list scraping. Uses Intuned Browser SDK for pagination and link extraction with AI-powered adaptability |
| `scraper/details` | Product details extraction combining SDK methods with `extract_structured_data` for unstructured fields like descriptions and specifications |
| `crawler/crawl` | Job board crawler that extracts structured job postings. Uses static Playwright extraction for Lever (`jobs.lever.co`), AI extraction with `extract_structured_data` for other boards (Greenhouse, etc.). Extracts title, location, department, team, description, commitment, workplace type |

## Learn More

- [Flexible Automations](https://docs.intunedhq.com/docs/02-features/flexible-automation)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [Extract Structured Data](https://docs.intunedhq.com/automation-sdks/intuned-sdk/python/ai/functions/extract_structured_data)
- [Stagehand act/extract/observe](https://docs.stagehand.dev/v2/basics/act)
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
