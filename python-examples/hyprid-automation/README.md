# Hybrid Automation

This example demonstrates **hybrid automation** - a flexible approach that combines the [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/intuned-sdk/overview) with AI-powered tools like [Stagehand](https://docs.stagehand.dev/) and `extract_structured_data`. This gives you the speed and reliability of traditional automation with the adaptability of AI when needed.

## Why Hybrid?

| Approach | Pros | Cons |
|----------|------|------|
| **Deterministic (Intuned Browser SDK)** | Fast, reliable, cost-effective | Breaks when site structure changes |
| **AI-Driven (Stagehand, extract_structured_data)** | Adapts to layout changes | Slower, less predictable |
| **Hybrid (This example)** | Best of both worlds | Slightly more complex |

The hybrid pattern: Use Intuned Browser SDK first (fast path), fall back to AI tools when needed.

Learn more: [Flexible Automations](https://docs.intunedhq.com/docs/02-features/flexible-automation)

## APIs

### 1. Form Filling (`hyprid-rpa/fill-form`)
RPA automation that fills a consultation booking form:
- Uses Playwright via Intuned Browser SDK for form fields
- Falls back to `stagehand.page.act()` if selector fails
- Verifies success with Playwright, falls back to `stagehand.page.extract()`

### 2. Product Scraper (`hyprid-scraper/list` & `details`)
E-commerce scraping with AI-powered data extraction:
- `list`: Uses Intuned Browser SDK for pagination and link extraction
- `details`: Combines SDK methods with `extract_structured_data` for unstructured fields

### 3. Job Board Crawler (`hyprid-crawler/crawl`)
Crawls job boards and extracts structured job postings:
- **Lever** (`jobs.lever.co`): Static Playwright extraction via Intuned Browser SDK
- **Other boards** (Greenhouse, etc.): AI extraction with `extract_structured_data`
- Extracts: title, location, department, team, description, commitment, workplace type

## Getting Started

### Install
```bash
uv sync
```

### Run APIs

```bash
# Form filling with AI fallback
uv run intuned run api hyprid-rpa/fill-form .parameters/api/hyprid-rpa/fill-form/default.json

# Product scraping
uv run intuned run api hyprid-scraper/list .parameters/api/hyprid-scraper/list/default.json
uv run intuned run api hyprid-scraper/details .parameters/api/hyprid-scraper/details/default.json

# Job board crawling (Lever - static extraction)
uv run intuned run api hyprid-crawler/crawl .parameters/api/hyprid-crawler/crawl/default.json

# Job board crawling (Greenhouse - AI extraction)
uv run intuned run api hyprid-crawler/crawl .parameters/api/hyprid-crawler/crawl/not-lever.json
```

### Deploy
```bash
uv run intuned deploy
```

## Project Structure
```
api/
├── hyprid-rpa/fill-form.py       # Form filling with Stagehand fallback
├── hyprid-scraper/
│   ├── list.py                   # Product list with pagination
│   └── details.py                # Product details with AI extraction
└── hyprid-crawler/crawl.py       # Job board crawler (hybrid extraction)

hooks/setup_context.py            # CDP URL setup for Stagehand
utils/crawler/                    # Crawler utilities
.parameters/api/                  # Test parameters for each API
```

## Learn More

- [Flexible Automations](https://docs.intunedhq.com/docs/02-features/flexible-automation)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/intuned-sdk/overview)
- [Extract Structured Data](https://docs.intunedhq.com/automation-sdks/intuned-sdk/python/helpers/functions/extract_structured_data)
- [Stagehand act/extract/observe](https://docs.stagehand.dev/v2/basics/act)
