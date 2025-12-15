# Scrapy Playwright Example

This example demonstrates how to run a [Scrapy](https://scrapy.org/) spider with [scrapy-playwright](https://github.com/scrapy-plugins/scrapy-playwright) integration on Intuned.

## Overview

This project shows how to:
- Set up a Scrapy project with Playwright for JavaScript-rendered pages
- Run Scrapy spiders from an Intuned automation
- Handle dynamic content that requires browser rendering

## Getting Started

### Install dependencies
```bash
uv sync
```

### Run via Intuned
```bash
uv run intuned run api list '{}'
```

### Deploy to Intuned
```bash
uv run intuned deploy
```

## Project Structure

```
/
├── api/
│   └── list.py                           # Intuned automation that runs the spider
├── scrapy_playwright_example/            # Scrapy project module
│   ├── __init__.py
│   ├── settings.py                       # Scrapy settings with Playwright config
│   ├── items.py                          # Scrapy item definitions
│   ├── middlewares.py                    # Custom middlewares (optional)
│   ├── pipelines.py                      # Item pipelines (optional)
│   └── spiders/
│       ├── __init__.py
│       └── quotes_spider.py              # Example spider
├── utils/
│   └── types_and_schemas.py              # Pydantic models for type validation
├── scrapy.cfg                            # Scrapy project configuration
├── Intuned.jsonc                         # Intuned project configuration
└── pyproject.toml                        # Python dependencies
```

## How It Works

1. **Spider Definition** (`scrapy_playwright_example/spiders/quotes_spider.py`):
   - Defines a Scrapy spider that uses Playwright for rendering
   - Uses `playwright_page_methods` to wait for dynamic content

2. **Intuned Automation** (`api/list.py`):
   - Runs the Scrapy spider via subprocess using `scrapy crawl`
   - Collects results from JSON output
   - Returns structured data

3. **Scrapy Settings** (`scrapy_playwright_example/settings.py`):
   - Configures `scrapy-playwright` download handlers
   - Sets Playwright browser options

## Key Configuration

### Playwright Settings in `settings.py`

```python
# Enable scrapy-playwright download handlers
DOWNLOAD_HANDLERS = {
    "http": "scrapy_playwright.handler.ScrapyPlaywrightDownloadHandler",
    "https": "scrapy_playwright.handler.ScrapyPlaywrightDownloadHandler",
}

# Browser configuration
PLAYWRIGHT_BROWSER_TYPE = "chromium"
PLAYWRIGHT_LAUNCH_OPTIONS = {"headless": True}

# Required for scrapy-playwright
TWISTED_REACTOR = "twisted.internet.asyncioreactor.AsyncioSelectorReactor"
```

### Using Playwright in Spider

```python
def start_requests(self):
    yield scrapy.Request(
        url,
        meta={
            "playwright": True,  # Enable Playwright for this request
            "playwright_page_methods": [
                PageMethod("wait_for_selector", "div.quote"),
            ],
        },
    )
```

## Customization

### Adding a New Spider

1. Create a new spider file in `scrapy_playwright_example/spiders/`
2. Update `api/list.py` to call your spider name
3. Modify the output parsing as needed

### Changing Browser Options

Edit `scrapy_playwright_example/settings.py`:

```python
PLAYWRIGHT_LAUNCH_OPTIONS = {
    "headless": False,  # Run with visible browser
    "slow_mo": 100,     # Slow down actions
}
```

## Resources

- [Scrapy Documentation](https://docs.scrapy.org/)
- [scrapy-playwright Documentation](https://github.com/scrapy-plugins/scrapy-playwright)
- [Intuned Documentation](https://docs.intunedhq.com/)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/intuned-sdk/overview)
