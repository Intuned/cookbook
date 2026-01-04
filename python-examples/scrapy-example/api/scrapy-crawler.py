import scrapy
from collector.item_collector import ItemCollector
from intuned_browser import go_to_url
from playwright.async_api import BrowserContext, Page
from scrapy.crawler import CrawlerRunner
from scrapy.utils.log import configure_logging
from scrapy.utils.reactor import install_reactor
from twisted.internet import reactor
from utils.types_and_schemas import ListParams, Quote


class QuotesSpider(scrapy.Spider):
    name = "quotes"  # replace with the name of your spider
    """QuotesSpider with pagination support for Scrapy's request system."""

    custom_settings = {
        "TWISTED_REACTOR": "twisted.internet.epollreactor.EPollReactor",
    }

    def __init__(self, url: str, max_pages: int, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.start_urls = [url]
        self.max_pages = max_pages
        self.current_page = 1

    async def start(self):
        for url in self.start_urls:
            yield scrapy.Request(url, dont_filter=True)

    def parse(self, response):
        """Parse the response and yield quotes."""
        # replace with the selectors for your spider
        for quote in response.css("div.quote"):
            yield {
                "text": quote.css("span.text::text").get(),
                "author": quote.css("small.author::text").get(),
                "tags": quote.css("div.tags a.tag::text").getall(),
            }
        if self.current_page >= self.max_pages:
            return
        # replace with the selector for the next page
        next_page = response.css("li.next a::attr(href)").get()
        if next_page:
            self.current_page += 1
            yield response.follow(next_page)


def run_scrapy(url: str, max_pages: int):
    install_reactor("twisted.internet.epollreactor.EPollReactor")
    configure_logging({"LOG_FORMAT": "%(levelname)s: %(message)s"})

    # Create collector to gather scraped items
    collector = ItemCollector()

    runner = CrawlerRunner()

    # Create crawler and connect signal handler to collect items
    crawler = runner.create_crawler(QuotesSpider)
    crawler.signals.connect(
        collector.item_scraped,
        signal=scrapy.signals.item_scraped,
    )

    # Start crawling
    d = crawler.crawl(url=url, max_pages=max_pages)

    # Stop reactor when crawl completes
    d.addBoth(lambda _: reactor.stop())
    reactor.run()

    # Return collected items
    return [Quote(**item) for item in collector.items]


async def automation(
    page: Page,
    params: ListParams,
    context: BrowserContext | None = None,
    **_kwargs,
) -> list[Quote]:
    """Scrapes the quotes from the quotes.toscrape.com website using Scrapy.

    Args:
        page (Page): The Playwright page object.
        params (ListParams): The parameters for the automation.
        context (BrowserContext | None, optional): The browser context. Defaults to None.

    Raises:
        ValueError: If the url is not provided.

    Returns:
        List[Quote]: The list of quotes.
    Example args:
    {
        "url": "https://quotes.toscrape.com/",
        "max_pages": 10
    }
    """
    params = ListParams(**params)
    if not params.url:
        raise ValueError("url is required")
    max_pages = params.max_pages or 10
    await go_to_url(page=page, url=params.url)
    items = run_scrapy(url=params.url, max_pages=max_pages)
    return items
