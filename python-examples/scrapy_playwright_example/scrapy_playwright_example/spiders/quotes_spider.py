import scrapy
from scrapy_playwright.page import PageMethod


class QuotesSpider(scrapy.Spider):
    """
    Spider that scrapes quotes from a JavaScript-rendered page using Playwright.

    Usage:
        scrapy crawl quotes -a url=https://quotes.toscrape.com/js/ -o quotes.json
    """

    name = "quotes"

    def __init__(self, url=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.start_urls = [url or "https://quotes.toscrape.com/js/"]

    async def start(self):
        """Async start method (Scrapy 2.13+)."""
        for url in self.start_urls:
            yield scrapy.Request(
                url,
                meta={
                    "playwright": True,
                    "playwright_page_methods": [
                        PageMethod("wait_for_selector", "div.quote"),
                    ],
                },
            )

    def parse(self, response):
        for quote in response.css("div.quote"):
            yield {
                "text": quote.css("span.text::text").get(),
                "author": quote.css("small.author::text").get(),
                "tags": quote.css("div.tags a.tag::text").getall(),
            }

        # Follow pagination if available
        next_page = response.css("li.next a::attr(href)").get()
        if next_page:
            yield response.follow(
                next_page,
                meta={
                    "playwright": True,
                    "playwright_page_methods": [
                        PageMethod("wait_for_selector", "div.quote"),
                    ],
                },
            )
