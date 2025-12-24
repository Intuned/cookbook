# Hybrid Automation

This example demonstrates **hybrid automation** - a flexible approach that combines the [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview) (`@intuned/browser`) with AI-powered tools like [Stagehand](https://docs.stagehand.dev/) and `extractStructuredData`. This gives you the speed and reliability of traditional automation with the adaptability of AI when needed.

## Run on Intuned

Open this project in Intuned by clicking the button below.

[![Run on Intuned](https://cdn1.intuned.io/button.svg)](https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/hybrid-automation)

## Why Hybrid?

| Approach | Pros | Cons |
|----------|------|------|
| **Deterministic (Intuned Browser SDK)** | Fast, reliable, cost-effective | Breaks when site structure changes |
| **AI-Driven (Stagehand, extractStructuredData)** | Adapts to layout changes | Slower, less predictable |
| **Hybrid (This example)** | Best of both worlds | Slightly more complex |

The hybrid pattern: Use Intuned Browser SDK first (fast path), fall back to AI tools when needed.

Learn more: [Flexible Automations](https://docs.intunedhq.com/docs/02-features/flexible-automation)

## APIs

### 1. Form Filling (`hybrid-rpa/fill-form`)
RPA automation that fills a consultation booking form:
- Uses Playwright via Intuned Browser SDK for form fields
- Falls back to `stagehand.page.act()` if selector fails
- Verifies success with Playwright, falls back to `stagehand.page.extract()`

### 2. Product Scraper (`hybrid-scraper/list` & `details`)
E-commerce scraping with AI-powered data extraction:
- `list`: Uses Intuned Browser SDK for pagination and link extraction
- `details`: Combines SDK methods with `extractStructuredData` for unstructured fields

### 3. Job Board Crawler (`hybrid-crawler/crawl`)
Crawls job boards and extracts structured job postings:
- **Lever** (`jobs.lever.co`): Static Playwright extraction via Intuned Browser SDK
- **Other boards** (Greenhouse, etc.): AI extraction with `extractStructuredData`
- Extracts: title, location, department, team, description, commitment, workplace type

## Getting Started

### Install
```bash
npm install
```

### Run APIs

```bash
# Form filling with AI fallback
npx intuned run api hybrid-rpa/fill-form .parameters/api/hybrid-rpa/fill-form/default.json

# Product scraping
npx intuned run api hybrid-scraper/list .parameters/api/hybrid-scraper/list/default.json
npx intuned run api hybrid-scraper/details .parameters/api/hybrid-scraper/details/default.json

# Job board crawling (Lever - static extraction)
npx intuned run api hybrid-crawler/crawl .parameters/api/hybrid-crawler/crawl/default.json

# Job board crawling (Greenhouse - AI extraction)
npx intuned run api hybrid-crawler/crawl .parameters/api/hybrid-crawler/crawl/not-lever.json
```

### Deploy
```bash
npx intuned deploy
```

## Project Structure
```
api/
├── hybrid-rpa/fill-form.ts       # Form filling with Stagehand fallback
├── hybrid-scraper/
│   ├── list.ts                   # Product list with pagination
│   └── details.ts                # Product details with AI extraction
└── hybrid-crawler/crawl.ts       # Job board crawler (hybrid extraction)

hooks/setupContext.ts             # CDP URL setup for Stagehand
utils/crawler/                    # Crawler utilities
.parameters/api/                  # Test parameters for each API
```

## Learn More

- [Flexible Automations](https://docs.intunedhq.com/docs/02-features/flexible-automation)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [Extract Structured Data](https://docs.intunedhq.com/automation-sdks/intuned-sdk/typescript/helpers/functions/extractStructuredData)
- [Stagehand act/extract/observe](https://docs.stagehand.dev/v2/basics/act)
