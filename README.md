A collection of examples for building browser automations with [Intuned](https://intunedhq.com).

## Quick Start

### 1. Install the CLI

```bash
npm install -g @intuned/cli
```

### 2. Create a project from a template

```bash
npx create-intuned-project@latest
```

The interactive wizard will ask for:

- **Language** — TypeScript or Python
- **Template** — choose from the examples listed in the tables below (e.g. `starter`, `rpa-example`)
- **Project name** — a name for your new project

### 3. Configure your API key

Create a `.env` file in your project root with your Intuned API key:

```
INTUNED_API_KEY=<your-api-key>
```

You can find your API key in the [Intuned dashboard](https://app.intuned.io).

### 4. Install dependencies and run an API

**TypeScript:**

```bash
yarn install
intuned dev run api <api-name> .parameters/api/<api-name>/default.json
```

**Python:**

```bash
uv sync
intuned dev run api <api-name> .parameters/api/<api-name>/default.json
```

> See the [CLI reference](https://intunedhq.com/docs/main/02-features/local-development-cli) for all available options.

## TypeScript Examples

| Example | Description |
|---------|-------------|
| [starter](./typescript-examples/starter/) | Starter template for new projects |
| [starter-auth](./typescript-examples/starter-auth/) | Starter template with Auth Sessions enabled |
| [starter-jsdom](./typescript-examples/starter-jsdom/) | Minimal JSDOM HTML parsing starter |
| [starter-network-interception](./typescript-examples/starter-network-interception/) | Minimal network interception starter |
| [starter-rpa](./typescript-examples/starter-rpa/) | Minimal RPA starter for browser automation |
| [starter-shopify](./typescript-examples/starter-shopify/) | Minimal Shopify product scraper starter |
| [starter-stagehand](./typescript-examples/starter-stagehand/) | Minimal Stagehand AI browser automation starter |
| [auth-with-email-otp](./typescript-examples/auth-with-email-otp/) | Multi-step authentication with Email-based OTP using Resend API |
| [auth-with-secret-otp](./typescript-examples/auth-with-secret-otp/) | Multi-step authentication with TOTP (Time-based OTP) using secret keys |
| [browser-sdk-showcase](./typescript-examples/browser-sdk-showcase/) | Comprehensive showcase of Browser SDK helper functions |
| [captcha-in-login](./typescript-examples/captcha-in-login/) | E-commerce scraper with captcha solving and auth sessions |
| [captcha-solving-basic](./typescript-examples/captcha-solving-basic/) | Basic captcha solving with reCAPTCHA, Cloudflare, and custom captchas |
| [cdp-connection](./typescript-examples/cdp-connection/) | Basic example demonstrating Chrome DevTools Protocol (CDP) connection |
| [computer-use](./typescript-examples/computer-use/) | AI-powered browser automation with Anthropic, OpenAI, and Gemini |
| [e-commerce-auth-scrapingcourse](./typescript-examples/e-commerce-auth-scrapingcourse/) | Authenticated e-commerce scraper with Auth Sessions |
| [e-commerce-nested](./typescript-examples/e-commerce-nested/) | E-commerce category and product scraper |
| [e-commerce-scrapingcourse](./typescript-examples/e-commerce-scrapingcourse/) | E-commerce product scraper with pagination |
| [e-commerce-shopify](./typescript-examples/e-commerce-shopify/) | Shopify store product scraper |
| [hybrid-automation](./typescript-examples/hybrid-automation/) | Hybrid automation combining Intuned Browser SDK with AI-powered tools like Stagehand and extractStructuredData |
| [jsdom](./typescript-examples/jsdom/) | Web scraping with JSDOM for HTML parsing |
| [native-crawler](./typescript-examples/native-crawler/) | Native web crawler for sitemaps and recursive link following |
| [network-interception](./typescript-examples/network-interception/) | Network interception for CSRF token capture and paginated API data |
| [playwright-basics](./typescript-examples/playwright-basics/) | Basic Playwright automation examples |
| [quick-recipes](./typescript-examples/quick-recipes/) | Quick browser automation recipes |
| [rpa-auth-example](./typescript-examples/rpa-auth-example/) | Authenticated consultation booking with Auth Sessions |
| [rpa-example](./typescript-examples/rpa-example/) | Consultation booking automation |
| [rpa-forms-example](./typescript-examples/rpa-forms-example/) | AI-powered form automation using Stagehand to fill insurance quote forms |
| [setup-hooks](./typescript-examples/setup-hooks/) | Demonstrates setup hooks for preparing data before API execution |
| [stagehand](./typescript-examples/stagehand/) | AI-powered browser automation with Stagehand |

## Python Examples

| Example | Description |
|---------|-------------|
| [starter](./python-examples/starter/) | Starter template for new projects |
| [starter-auth](./python-examples/starter-auth/) | Starter template with Auth Sessions enabled |
| [starter-network-interception](./python-examples/starter-network-interception/) | Minimal network interception starter |
| [starter-rpa](./python-examples/starter-rpa/) | Minimal RPA starter for browser automation |
| [starter-scrapy](./python-examples/starter-scrapy/) | Minimal Scrapy starter |
| [starter-shopify](./python-examples/starter-shopify/) | Minimal Shopify product scraper starter |
| [starter-stagehand](./python-examples/starter-stagehand/) | Minimal Stagehand AI browser automation starter |
| [auth-with-email-otp](./python-examples/auth-with-email-otp/) | Multi-step authentication with Email-based OTP using Resend API |
| [auth-with-secret-otp](./python-examples/auth-with-secret-otp/) | Multi-step authentication with TOTP (Time-based OTP) using secret keys |
| [browser-sdk-showcase](./python-examples/browser-sdk-showcase/) | Comprehensive showcase of Browser SDK helper functions |
| [browser-use](./python-examples/browser-use/) | AI browser automation with Browser-Use |
| [bs4](./python-examples/bs4/) | Web scraping with BeautifulSoup for HTML parsing |
| [captcha-in-login](./python-examples/captcha-in-login/) | E-commerce scraper with captcha solving and auth sessions |
| [captcha-solving-basic](./python-examples/captcha-solving-basic/) | Basic captcha solving with reCAPTCHA, Cloudflare, and custom captchas |
| [cdp-connection](./python-examples/cdp-connection/) | Basic example demonstrating Chrome DevTools Protocol (CDP) connection |
| [computer-use](./python-examples/computer-use/) | AI-powered browser automation with Anthropic, OpenAI, Gemini, and Browser Use |
| [crawl4ai](./python-examples/crawl4ai/) | Web crawling using Crawl4AI library |
| [e-commerce-auth-scrapingcourse](./python-examples/e-commerce-auth-scrapingcourse/) | Authenticated e-commerce scraper with Auth Sessions |
| [e-commerce-nested](./python-examples/e-commerce-nested/) | E-commerce category and product scraper |
| [e-commerce-scrapingcourse](./python-examples/e-commerce-scrapingcourse/) | E-commerce product scraper with pagination |
| [e-commerce-shopify](./python-examples/e-commerce-shopify/) | Shopify store product scraper |
| [firecrawl](./python-examples/firecrawl/) | Web scraping with Firecrawl library |
| [hybrid-automation](./python-examples/hybrid-automation/) | Hybrid automation combining Intuned Browser SDK with AI-powered tools like Stagehand and extract_structured_data |
| [native-crawler](./python-examples/native-crawler/) | Native web crawler for sitemaps and recursive link following |
| [network-interception](./python-examples/network-interception/) | Network interception for CSRF token capture and paginated API data |
| [playwright-basics](./python-examples/playwright-basics/) | Basic Playwright automation examples |
| [quick-recipes](./python-examples/quick-recipes/) | Quick browser automation recipes |
| [rpa-auth-example](./python-examples/rpa-auth-example/) | Authenticated consultation booking with Auth Sessions |
| [rpa-example](./python-examples/rpa-example/) | Consultation booking automation |
| [rpa-forms-example](./python-examples/rpa-forms-example/) | AI-powered form automation using Stagehand to fill insurance quote forms |
| [scrapy](./python-examples/scrapy/) | Web scraping with Scrapy framework (HTTP requests and Playwright integration) |
| [setup-hooks](./python-examples/setup-hooks/) | Demonstrates setup hooks for preparing data before API execution |
| [stagehand](./python-examples/stagehand/) | AI-powered browser automation with Stagehand |
