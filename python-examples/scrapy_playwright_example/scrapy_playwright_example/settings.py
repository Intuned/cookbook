# Scrapy settings for scrapy_playwright_example project
#
# For more settings, see:
# https://docs.scrapy.org/en/latest/topics/settings.html

BOT_NAME = "scrapy_playwright_example"

SPIDER_MODULES = ["scrapy_playwright_example.spiders"]
NEWSPIDER_MODULE = "scrapy_playwright_example.spiders"

# ============================================================================
# Playwright Settings (from scrapy-playwright package)
# ============================================================================

DOWNLOAD_HANDLERS = {
    "http": "scrapy_playwright.handler.ScrapyPlaywrightDownloadHandler",
    "https": "scrapy_playwright.handler.ScrapyPlaywrightDownloadHandler",
}

PLAYWRIGHT_BROWSER_TYPE = "chromium"
PLAYWRIGHT_LAUNCH_OPTIONS = {"headless": True}

# ============================================================================
# Scrapy Settings
# ============================================================================

# Obey robots.txt rules
ROBOTSTXT_OBEY = False

# Configure maximum concurrent requests (default: 16)
# CONCURRENT_REQUESTS = 16

# Configure a delay for requests for the same website
# DOWNLOAD_DELAY = 1

# Disable cookies (enabled by default)
# COOKIES_ENABLED = False

# ============================================================================
# Middlewares (uncomment to enable custom middlewares)
# ============================================================================
# SPIDER_MIDDLEWARES = {
#     "scrapy_playwright_example.middlewares.ScrapyPlaywrightExampleSpiderMiddleware": 543,
# }

# DOWNLOADER_MIDDLEWARES = {
#     "scrapy_playwright_example.middlewares.ScrapyPlaywrightExampleDownloaderMiddleware": 543,
# }

# ============================================================================
# Item Pipelines (uncomment to enable)
# ============================================================================
# ITEM_PIPELINES = {
#     "scrapy_playwright_example.pipelines.ScrapyPlaywrightExamplePipeline": 300,
# }

# ============================================================================
# Required Settings
# ============================================================================
REQUEST_FINGERPRINTER_IMPLEMENTATION = "2.7"
TWISTED_REACTOR = "twisted.internet.asyncioreactor.AsyncioSelectorReactor"
FEED_EXPORT_ENCODING = "utf-8"
