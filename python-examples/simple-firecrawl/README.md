# Simple Firecrawl

> **Firecrawl-compatible web scraping APIs powered by [crawl4ai](https://crawl4ai.com) 🔥**

Build web scraping automations using Firecrawl's familiar API interface, but running on the powerful open-source crawl4ai backend with [Intuned](https://intunedhq.com)'s browser automation infrastructure.

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
  "api_key": "tvly-xxxxx",
  "scrapeOptions": {
    "formats": ["markdown"]
  }
}
```

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

> **Note:** Requires a Tavily API key (free tier available at [tavily.com](https://tavily.com))

---

## 🛠️ How to Run

### Local Testing with Intuned CLI

```bash
# Install dependencies
cd python-examples/simple-firecrawl
uv sync

# Run any endpoint locally
uv run intuned run api scrape .parameters/api/scrape/default.json
uv run intuned run api map .parameters/api/map/default.json
uv run intuned run api crawl .parameters/api/crawl/default.json
uv run intuned run api search .parameters/api/search/default.json
```

### Deploy to Intuned

```bash
# Deploy to production
uv run intuned deploy
```

See [Intuned Documentation](https://docs.intunedhq.com) for deployment details.

---

## 🎓 Learn More

### Documentation Links

- **Firecrawl API Reference:** [docs.firecrawl.dev](https://docs.firecrawl.dev/api-reference/introduction)
- **crawl4ai Documentation:** [docs.crawl4ai.com](https://docs.crawl4ai.com)
- **Intuned Platform:** [docs.intunedhq.com](https://docs.intunedhq.com)

---

## `Intuned.jsonc` Reference

```jsonc
{
  // Your Intuned workspace ID.
  // Optional - If not provided here, it must be supplied via the `--workspace-id` flag during deployment.
  "workspaceId": "your_workspace_id",

  // The name of your Intuned project.
  // Optional - If not provided here, it must be supplied via the command line when deploying.
  "projectName": "your_project_name",

  // Replication settings
  "replication": {
    // The maximum number of concurrent executions allowed via Intuned API. This does not affect jobs.
    // A number of machines equal to this will be allocated to handle API requests.
    // Not applicable if api access is disabled.
    "maxConcurrentRequests": 1,

    // The machine size to use for this project. This is applicable for both API requests and jobs.
    // "standard": Standard machine size (6 shared vCPUs, 2GB RAM)
    // "large": Large machine size (8 shared vCPUs, 4GB RAM)
    // "xlarge": Extra large machine size (1 performance vCPU, 8GB RAM)
    "size": "standard"
  }

  // Auth session settings
  "authSessions": {
    // Whether auth sessions are enabled for this project.
    // If enabled, "auth-sessions/check.ts" API must be implemented to validate the auth session.
    "enabled": true,

    // Whether to save Playwright traces for auth session runs.
    "saveTraces": false,

    // The type of auth session to use.
    // "API" type requires implementing "auth-sessions/create.ts" API to create/recreate the auth session programmatically.
    // "MANUAL" type uses a recorder to manually create the auth session.
    "type": "API",


    // Recorder start URL for the recorder to navigate to when creating the auth session.
    // Required if "type" is "MANUAL". Not used if "type" is "API".
    "startUrl": "https://example.com/login",

    // Recorder finish URL for the recorder. Once this URL is reached, the recorder stops and saves the auth session.
    // Required if "type" is "MANUAL". Not used if "type" is "API".
    "finishUrl": "https://example.com/dashboard",

    // Recorder browser mode
    // "fullscreen": Launches the browser in fullscreen mode.
    // "kiosk": Launches the browser in kiosk mode (no address bar, no navigation controls).
    // Only applicable for "MANUAL" type.
    "browserMode": "fullscreen"
  }

  // API access settings
  "apiAccess": {
    // Whether to enable consumption through Intuned API. If this is false, the project can only be consumed through jobs.
    // This is required for projects that use auth sessions.
    "enabled": true
  },

  // Whether to run the deployed API in a headful browser. Running in headful can help with some anti-bot detections. However, it requires more resources and may work slower or crash if the machine size is "standard".
  "headful": false,

  // The region where your Intuned project is hosted.
  // For a list of available regions, contact support or refer to the documentation.
  // Optional - Default: "us"
  "region": "us"
}
```
