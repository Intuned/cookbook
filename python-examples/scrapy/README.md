# Scrapy Example Intuned Project

This project demonstrates how to use [Scrapy](https://scrapy.org/) for web scraping within Intuned's browser automation environment. It includes two approaches:

1. **`scrapy-crawler`**: Uses Scrapy's built-in HTTP request system for scraping static websites
2. **`scrapy-crawler-js`**: Uses Playwright to render JavaScript-heavy pages, then parses the HTML with Scrapy

<!-- IDE-IGNORE-START -->
## Run on Intuned

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/scrapy" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>

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
# Scrapy crawler (static sites)
intuned dev run api scrapy-crawler .parameters/api/scrapy-crawler/default.json

# Scrapy crawler with JavaScript rendering (using Playwright)
intuned dev run api scrapy-crawler-js .parameters/api/scrapy-crawler-js/default.json
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

## Technologies Used

### Scrapy

This project uses [Scrapy](https://scrapy.org/), a powerful web scraping framework for Python. Scrapy provides:

- Built-in HTTP request handling
- Powerful CSS and XPath selectors
- Item pipelines for data processing
- Built-in support for pagination and following links

### Intuned Browser SDK

This project uses Intuned browser SDK for browser automation. For more information, check out the [Intuned Browser SDK documentation](https://docs.intunedhq.com/automation-sdks/overview).

### Playwright

The `scrapy-crawler-js` API uses Playwright to render JavaScript-heavy pages before parsing with Scrapy. This allows you to scrape dynamic content that requires JavaScript execution.

## Project Structure

The project structure is as follows:

```text
/
├── api/                      # API endpoints
│   ├── scrapy-crawler.py     # Scrapy crawler using Scrapy's HTTP requests
│   └── scrapy-crawler-js.py  # Scrapy crawler using Playwright + Scrapy parsing
├── collector/                # Item collection utilities
│   └── item_collector.py     # Collects scraped items via Scrapy signals
├── utils/                    # Utility modules
│   └── types_and_schemas.py  # Pydantic models for parameters and data
├── intuned-resources/
│   └── jobs/
│       ├── scrapy-crawler.job.jsonc    # Job for static site crawling
│       └── scrapy-crawler-js.job.jsonc # Job for JS-rendered crawling
├── .parameters/api/          # Parameter files for testing
├── Intuned.jsonc             # Intuned project configuration file
└── pyproject.toml            # Python project dependencies
```

### API Endpoints

- **`scrapy-crawler`**: Uses Scrapy's `CrawlerRunner` to make HTTP requests and scrape static websites. Best for sites that don't require JavaScript rendering.
- **`scrapy-crawler-js`**: Uses Playwright to navigate and render pages, then creates Scrapy `HtmlResponse` objects for parsing. Best for JavaScript-heavy websites.

### Key Components

- **`QuotesSpider`**: Scrapy spider class that defines how to parse quotes from the target website
- **`ItemCollector`**: Collects scraped items via Scrapy's signal system
- **`ListParams`**: Pydantic model for API parameters (url, max_pages)
- **`Quote`**: Pydantic model for scraped quote data (text, author, tags)

## Customizing for Your Use Case

To adapt this example for your own scraping needs:

1. **Update the Spider**: Modify the `QuotesSpider` class in the API files:
   - Change CSS selectors to match your target website
   - Update the data structure being yielded
   - Adjust pagination logic if needed

2. **Update Data Models**: Modify `utils/types_and_schemas.py`:
   - Update `ListParams` for your API parameters
   - Update `Quote` (or create new models) for your scraped data

3. **Choose the Right Approach**:
   - Use `scrapy-crawler` for static websites
   - Use `scrapy-crawler-js` for JavaScript-heavy sites

## Learn More

- [Intuned CLI](https://docs.intunedhq.com/docs/05-references/cli/overview)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/overview)
- [Scrapy Documentation](https://docs.scrapy.org/)
- [Intuned llm.txt](https://docs.intunedhq.com/llms.txt)
