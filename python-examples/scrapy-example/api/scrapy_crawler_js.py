import scrapy
from scrapy.http import HtmlResponse
from playwright.async_api import Page, BrowserContext
from intuned_browser import go_to_url
from utils.types_and_schemas import ListParams, Quote


class QuotesSpider(scrapy.Spider):
    name = "quotes"

    def parse(self, response):
        print(f"Parsing page: {response.url}")

        count = 0
        for quote in response.css("div.quote"):
            count += 1
            yield Quote(
                text=quote.css("span.text::text").get(),
                author=quote.css("small.author::text").get(),
                tags=quote.css("div.tags a.tag::text").getall(),
            )

        print(f"Extracted {count} quotes from {response.url}")


async def is_next_page_available(page: Page) -> bool:
    next_link = await page.query_selector("li.next a")
    return next_link is not None


async def go_to_next_page(page: Page) -> None:
    next_link = await page.query_selector("li.next a")
    await next_link.click()
    await page.wait_for_load_state("networkidle")


async def automation(
    page: Page,
    params: ListParams,
    context: BrowserContext | None = None,
    **_kwargs,
) -> list[Quote]:
    """
    Scrapes the quotes from the quotes.toscrape.com website using Scrapy and Playwright.
    Example params:
    {
        "url": "https://quotes.toscrape.com/",
        "max_pages": 10
    }
    """
    params = ListParams(**params)

    if not params.url:
        raise ValueError("url is required")

    max_pages = params.max_pages or 10

    print("Starting quotes scraping")
    print(f"URL: {params.url} | Max pages: {max_pages}")

    spider = QuotesSpider()
    items: list[Quote] = []

    current_page = 1
    next_url = params.url

    while next_url and current_page <= max_pages:
        print(f"Visiting page {current_page}: {next_url}")

        await go_to_url(page=page, url=next_url)

        html = await page.content()

        response = HtmlResponse(
            url=page.url,
            body=html,
            encoding="utf-8",
        )

        page_items = list(spider.parse(response))
        items.extend(page_items)

        print(f"Page {current_page} done | Items so far: {len(items)}")

        has_next_page = await is_next_page_available(page)
        if has_next_page:
            await go_to_next_page(page)
        else:
            break

        current_page += 1

    print(f"Scraping finished | Total items: {len(items)}")

    return items
