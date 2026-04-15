# Firecrawl

> **Firecrawl-compatible web scraping APIs powered by [crawl4ai](https://crawl4ai.com) 🔥**

Build web scraping automations using Firecrawl's familiar API interface, but running on the powerful open-source crawl4ai backend with [Intuned](https://intunedhq.com)'s browser automation infrastructure.

<!-- IDE-IGNORE-START -->
## Run on Intuned

<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/python-examples/firecrawl" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>
<!-- IDE-IGNORE-END -->

## 🚀 Why This Project?

- No Firecrawl subscription needed - runs on crawl4ai (open source)
- Same API interface as Firecrawl for easy migration
- Built on crawl4ai with deep crawling, content selection, and adaptive strategies
- Deploy instantly with Intuned's managed browser infrastructure

## 📚 What's Inside

This project implements **4 Firecrawl-compatible endpoints**:

| Endpoint     | Firecrawl Docs                                                         | Description                                                            |
| ------------ | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **`scrape`** | [/scrape](https://docs.firecrawl.dev/api-reference/endpoint/scrape)    | 📄 Single-page scraping with markdown, HTML, screenshots, and metadata |
| **`map`**    | [/map](https://docs.firecrawl.dev/api-reference/endpoint/map)          | 🗺️ Extract all links from a page with titles and descriptions          |
| **`crawl`**  | [/crawl](https://docs.firecrawl.dev/api-reference/endpoint/crawl-post) | 🕷️ Deep crawl multiple pages with BFS strategy, filters, and sitemaps  |
| **`search`** | [/search](https://docs.firecrawl.dev/api-reference/endpoint/search)    | 🔍 Web search with full content using Tavily API                       |

---

## 🎯 Quick Examples

### 1️⃣ Scrape a Single Page

Extract content in multiple formats from any webpage.

**Parameters:**

```json
{
  "url": "https://docs.crawl4ai.com",
  "formats": ["markdown", "html", "screenshot"],
  "onlyMainContent": true,
  "excludeTags": ["nav", "footer"],
  "waitFor": 1000
}
```

**Use Cases:**

- Blog post extraction
- Product page scraping
- Documentation parsing

**Key Features:**

- Multiple output formats (markdown, HTML, raw HTML, screenshots, links)
- Content filtering with `includeTags`/`excludeTags`
- Mobile viewport support
- Custom headers and TLS verification control
- Geo-location support

---

### 2️⃣ Map All Links

Discover all internal links on a page or sitemap.

**Parameters:**

```json
{
  "url": "https://docs.crawl4ai.com",
  "sitemap": "include",
  "includeSubdomains": true,
  "search": "tutorial",
  "limit": 100
}
```

**Use Cases:**

- Site structure analysis
- Link discovery for crawling
- Sitemap generation

**Key Features:**

- Sitemap parsing (`include`, `skip`, `only`)
- Subdomain control
- Search filtering by relevance
- Link metadata (title, description)
- Query parameter normalization

---

### 3️⃣ Deep Crawl a Website

Crawl multiple pages with breadth-first search strategy.

**Parameters:**

```json
{
  "url": "https://docs.crawl4ai.com/core/",
  "limit": 50,
  "maxDiscoveryDepth": 3,
  "crawlEntireDomain": false,
  "allowSubdomains": false,
  "allowExternalLinks": false,
  "sitemap": "include",
  "excludePaths": [".*/blog/.*"],
  "includePaths": [".*/docs/.*"],
  "scrapeOptions": {
    "formats": ["markdown"],
    "onlyMainContent": true
  }
}
```

**Use Cases:**

- Documentation scraping
- E-commerce product catalogs
- Knowledge base extraction

**Key Features:**

- **BFS deep crawling** with depth control
- **Domain restrictions**: exact domain, subdomains, or external links
- **Path filtering**: include/exclude URL patterns
- **Sitemap integration**: combine sitemap + discovered links
- **Per-page scraping options**: same as `/scrape` endpoint
- **Concurrent crawling** with `maxConcurrency`
- **Query parameter handling**

**How It Works:**

1. Starts from `url` and optionally fetches sitemap URLs
2. Crawls up to `maxDiscoveryDepth` levels deep
3. Filters URLs based on domain, subdomain, and path rules
4. Stops when `limit` pages are scraped
5. Returns all scraped pages as an array

---

### 4️⃣ Search the Web

Search the web and get full content from results using Tavily.

**Parameters:**

```json
{
  "query": "web scraping best practices",
  "limit": 5,
  "sources": ["web", "images", "news"],
  "categories": [{ "type": "github" }],
  "tbs": "past_week",
  "country": "US",
  "api_key": "tvly-api-key",
  "scrapeOptions": {
    "formats": ["markdown"]
  }
}
```

Replace `tvly-api-key` in `.parameters/api/search/default.json` or any other
search params file with your real Tavily API key before running `search`.

**Use Cases:**

- Research automation
- Competitive analysis
- Content aggregation

**Key Features:**

- Powered by [Tavily API](https://tavily.com)
- Multiple sources (web, images, news)
- Category filtering (GitHub, research papers, PDFs)
- Time-based filtering
- Full content extraction (markdown)
- Country-specific results

> **Note:** Requires a Tavily API key (free tier available at [tavily.com](https://tavily.com)). Set it in your search params JSON by replacing the `tvly-api-key` placeholder.

---

<!-- IDE-IGNORE-START -->
## 🛠️ How to Run

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
intuned dev run api scrape .parameters/api/scrape/default.json
intuned dev run api map .parameters/api/map/default.json
intuned dev run api crawl .parameters/api/crawl/default.json
intuned dev run api search .parameters/api/search/default.json
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

---

## Project Structure

```text
/
├── api/
│   ├── scrape.py             # Single-page scraping
│   ├── map.py                # Extract all links from a page
│   ├── crawl.py              # Deep crawl multiple pages
│   └── search.py             # Web search with full content
├── intuned-resources/
│   └── jobs/
│       ├── scrape.job.jsonc
│       ├── map.job.jsonc
│       ├── crawl.job.jsonc
│       └── search.job.jsonc
├── .parameters/api/          # Parameter files for testing
├── Intuned.jsonc
└── pyproject.toml
```

## 🎓 Learn More

- [Intuned CLI](https://intunedhq.com/docs/main/05-references/cli/overview)
- [Intuned Browser SDK](https://intunedhq.com/docs/automation-sdks/overview)
- **Firecrawl API Reference:** [docs.firecrawl.dev](https://docs.firecrawl.dev/api-reference/introduction)
- **crawl4ai Documentation:** [docs.crawl4ai.com](https://docs.crawl4ai.com)
- [Intuned llm.txt](https://intunedhq.com/docs/llms.txt)
