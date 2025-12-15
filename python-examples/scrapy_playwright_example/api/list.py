import asyncio
import json
import tempfile
from pathlib import Path
from intuned_browser import go_to_url
from playwright.async_api import Page, BrowserContext
from typing import List
from utils.types_and_schemas import ListParams, Quote


async def run_scrapy_crawl(url: str) -> List[Quote]:
    """
    Run the Scrapy spider using 'scrapy crawl' command.

    Args:
        url: The URL to scrape

    Returns:
        List of scraped items
    """
    # Create a temporary file for JSON output
    with tempfile.NamedTemporaryFile(
        mode="w", suffix=".json", delete=False
    ) as output_file:
        output_path = Path(output_file.name)

    try:
        # Build the scrapy crawl command
        cmd = [
            "scrapy",
            "crawl",
            "quotes",
            "-a",
            f"url={url}",
            "-O",
            str(output_path),  # -O overwrites the file
            "--loglevel",
            "INFO",
        ]

        print(f"Running: {' '.join(cmd)}")

        # Run scrapy crawl in a subprocess
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )

        stdout, stderr = await process.communicate()

        # Log output for debugging
        if stdout:
            print(f"Scrapy stdout: {stdout.decode()}")
        if stderr:
            # Scrapy logs to stderr by default
            print(f"Scrapy logs: {stderr.decode()}")

        if process.returncode != 0:
            error_msg = stderr.decode() if stderr else "Unknown error"
            raise RuntimeError(
                f"Scrapy crawl failed with code {process.returncode}: {error_msg}"
            )

        # Read the results from the JSON output file
        if output_path.exists() and output_path.stat().st_size > 0:
            with open(output_path, "r") as f:
                return [Quote(**quote) for quote in json.load(f)]
        return []

    finally:
        # Cleanup the temporary output file
        output_path.unlink(missing_ok=True)


async def automation(
    page: Page,
    params: ListParams,
    context: BrowserContext | None = None,
    **_kwargs,
) -> List[Quote]:
    """
    Scrapes quotes using Scrapy with Playwright integration.

    This example demonstrates running a Scrapy spider with scrapy-playwright
    within an Intuned automation.

    The spider is defined in: scrapy_playwright_example/spiders/quotes_spider.py

    Example params:
    {
        "url": "https://quotes.toscrape.com/js/"
    }
    """
    params = ListParams(**params)
    url = params.url
    await go_to_url(page, url)
    print(f"Starting Scrapy spider for: {url}")

    # Run the Scrapy spider
    quotes = await run_scrapy_crawl(url)

    print(f"Total quotes found: {len(quotes)}")

    return quotes
