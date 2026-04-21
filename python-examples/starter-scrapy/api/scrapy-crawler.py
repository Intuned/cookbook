"""
Minimal Scrapy starter: scrape quotes from a single page using Scrapy.
"""

import asyncio
import platform
from typing import TypedDict

import scrapy
from intuned_browser import go_to_url
from playwright.async_api import BrowserContext, Page
from scrapy.crawler import CrawlerRunner
from scrapy.utils.log import configure_logging
from scrapy.utils.reactor import install_reactor


def get_reactor_path() -> str:
    system = platform.system().lower()
    if system == "linux":
        return "twisted.internet.epollreactor.EPollReactor"
    if system == "darwin":
        return "twisted.internet.kqreactor.KQueueReactor"
    if system == "windows":
        return "twisted.internet.iocpreactor.IOCPReactor"
    return "twisted.internet.selectreactor.SelectReactor"


REACTOR_PATH = get_reactor_path()


class ItemCollector:
    def __init__(self):
        self.items: list[dict] = []

    def item_scraped(self, item, response, spider):
        self.items.append(dict(item))


class QuotesSpider(scrapy.Spider):
    name = "quotes"
    custom_settings = {"TWISTED_REACTOR": REACTOR_PATH}

    def __init__(self, url: str, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.start_urls = [url]

    async def start(self):
        for url in self.start_urls:
            yield scrapy.Request(url, dont_filter=True)

    def parse(self, response):
        for quote in response.css("div.quote"):
            yield {
                "text": quote.css("span.text::text").get(),
                "author": quote.css("small.author::text").get(),
                "tags": quote.css("div.tags a.tag::text").getall(),
            }


def run_scrapy(url: str):
    install_reactor(REACTOR_PATH)
    configure_logging({"LOG_FORMAT": "%(levelname)s: %(message)s"})
    from twisted.internet import reactor

    collector = ItemCollector()
    runner = CrawlerRunner()
    crawler = runner.create_crawler(QuotesSpider)
    crawler.signals.connect(collector.item_scraped, signal=scrapy.signals.item_scraped)

    d = crawler.crawl(url=url)
    d.addBoth(lambda _: reactor.stop())
    reactor.run(installSignalHandlers=False)
    return collector.items


class Params(TypedDict, total=False):
    url: str


async def automation(
    page: Page,
    params: Params,
    context: BrowserContext | None = None,
    **_kwargs,
):
    url = params.get("url")
    if not url:
        raise ValueError("url is required")

    await go_to_url(page=page, url=url)
    items = await asyncio.to_thread(run_scrapy, url=url)
    return {"count": len(items), "items": items}
