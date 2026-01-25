# Hybrid Automation

Flexible automation combining the [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview) with AI-powered tools like [Stagehand](https://docs.stagehand.dev/) and `extractStructuredData` for speed, reliability, and adaptability.

## Key Features

- **Best of Both Worlds**: Combines fast, reliable SDK automation with AI adaptability
- **Smart Fallbacks**: Uses deterministic methods first, falls back to AI when needed
- **Three Use Cases**: RPA form filling, e-commerce scraping, and job board crawling
- **Production Ready**: Cost-effective primary path with AI safety net for edge cases

## Why Hybrid?

| Approach | Pros | Cons |
| ---------- | ------ | ------ |
| **Deterministic (Intuned Browser SDK)** | Fast, reliable, cost-effective | Breaks when site structure changes |
| **AI-Driven (Stagehand, extractStructuredData)** | Adapts to layout changes | Slower, less predictable |
| **Hybrid (This example)** | Best of both worlds | Slightly more complex |

The hybrid pattern: Use Intuned Browser SDK first (fast path), fall back to AI tools when needed.

Learn more: [Flexible Automations](https://docs.intunedhq.com/docs/02-features/flexible-automation)

## `@intuned/browser`: Intuned Browser SDK

This project uses Intuned browser SDK. For more information, check out the [Intuned Browser SDK documentation](https://docs.intunedhq.com/automation-sdks/overview).

<!-- IDE-IGNORE-START -->
## Run on Intuned

[![Run on Intuned](https://cdn1.intuned.io/button.svg)](https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/hybrid-automation)

## Getting Started

To get started developing browser automation projects with Intuned, check out our [Quick Starts Guide](https://docs.intunedhq.com/docs/00-getting-started/quickstarts).

## Development

> **_NOTE:_**  All commands support `--help` flag to get more information about the command and its arguments and options.

### Setup

**Important:** This template uses Intuned's AI gateway for AI-powered features (Stagehand and `extractStructuredData`). The AI gateway requires the project to be saved before running any APIs.

To save the project to intuned, you need to set up your Intuned workspace:

1. **Create a workspace** - Follow the [workspace management guide](https://docs.intunedhq.com/docs/03-how-to/manage/manage-workspace) to create your Intuned workspace

2. **Get your API key** - Generate an API key from the [API keys page](https://docs.intunedhq.com/docs/03-how-to/manage/manage-api-keys#how-to-manage-api-keys) in your Intuned dashboard

3. **Configure workspace ID** - Add your workspace ID and Project Name to `Intuned.jsonc`:

   ```jsonc
   {
     "workspaceId": "your-workspace-id",
     "projectName": "your-project-name" // Will be used as the name of this project.
     // ... rest of config
   }
   ```

4. **Set environment variable** - Add your API key as an environment variable:

   ```bash
   export INTUNED_API_KEY=your-api-key
   ```

### Install dependencies

```bash
npm install
```

After installing dependencies, `intuned` command should be available in your environment.

### Initialize project

Run the save command to upload your project and set up the required `.env` file:

```bash
npx intuned save
```

Reference for saving project [here](https://docs.intunedhq.com/docs/02-features/local-development-cli#use-runtime-sdk-and-browser-sdk-helpers)

This will configure your local environment and prepare the AI gateway for running.

### Run an API

Now you're ready to run the APIs:

```bash
npx intuned run api rpa/fill-form .parameters/api/rpa/fill-form/default.json
npx intuned run api scraper/list .parameters/api/scraper/list/default.json
npx intuned run api scraper/details .parameters/api/scraper/details/default.json
npx intuned run api crawler/crawl .parameters/api/crawler/crawl/default.json
npx intuned run api crawler/crawl .parameters/api/crawler/crawl/job-posting.json
npx intuned run api crawler/crawl .parameters/api/crawler/crawl/not-lever.json
```

### Save project

```bash
# npm
npm run intuned provision

# yarn
yarn intuned provision
```

### Deploy project

```bash
yarn intuned deploy
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
│       │       └── default.json
│       └── crawler/
│           └── crawl/
│               ├── default.json
                └── job-posting.json
│               └── not-lever.json
├── api/                          # API endpoints
│   ├── rpa/
│   │   └── fill-form.ts          # Form filling with Stagehand fallback
│   ├── scraper/
│   │   ├── list.ts               # Product list with pagination
│   │   └── details.ts            # Product details with AI extraction
│   └── crawler/
│       └── crawl.ts              # Job board crawler (hybrid extraction)
├── hooks/
│   └── setupContext.ts           # CDP URL setup for Stagehand
├── utils/
│   └── crawler/                  # Crawler utilities
├── Intuned.jsonc                 # Intuned project configuration
├── package.json                  # Node.js project dependencies
└── tsconfig.json                 # TypeScript configuration
```

## APIs

| API | Description |
| ----- | ------------- |
| `rpa/fill-form` | RPA automation that fills consultation booking forms. Uses Playwright via Intuned Browser SDK for form fields, falls back to `stagehand.page.act()` if selectors fail. Verifies success with Playwright, falls back to `stagehand.page.extract()` |
| `scraper/list` | E-commerce product list scraping. Uses Intuned Browser SDK for pagination and link extraction with AI-powered adaptability |
| `scraper/details` | Product details extraction combining SDK methods with `extractStructuredData` for unstructured fields like descriptions and specifications |
| `crawler/crawl` | Job board crawler that extracts structured job postings. Uses static Playwright extraction for Lever (`jobs.lever.co`), AI extraction with `extractStructuredData` for other boards (Greenhouse, etc.). Extracts title, location, department, team, description, commitment, workplace type |

## Learn More

- [Flexible Automations](https://docs.intunedhq.com/docs/02-features/flexible-automation)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [Extract Structured Data](https://docs.intunedhq.com/automation-sdks/intuned-sdk/typescript/ai/functions/extractStructuredData)
- [Stagehand act/extract/observe](https://docs.stagehand.dev/v2/basics/act)
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
