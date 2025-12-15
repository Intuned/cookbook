"""
Extract structured data from a page using LLM.

Firecrawl-compatible /extract endpoint using crawl4ai.
Uses LLMExtractionStrategy for AI-powered extraction.

Usage:
    uv run intuned run api extract '{"url": "https://example.com", "api_key": "sk-..."}'
"""

from playwright.async_api import Page, BrowserContext
from typing import TypedDict
import json
from pydantic import BaseModel
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, CacheMode, LLMConfig
from crawl4ai import LLMExtractionStrategy


class ExtractedData(BaseModel):
    title: str
    summary: str
    key_points: list[str]


class Params(TypedDict, total=False):
    url: str
    instruction: str
    api_key: str
    provider: str


async def automation(
    page: Page,
    params: Params | None = None,
    context: BrowserContext | None = None,
    **_kwargs,
):
    url = params.get("url")
    if not url:
        return {"success": False, "error": "url parameter is required"}

    api_key = params.get("api_key")
    if not api_key:
        return {"success": False, "error": "api_key parameter is required"}

    instruction = params.get(
        "instruction", "Extract the title, summary, and key points from this page."
    )
    provider = params.get("provider", "openai/gpt-4o-mini")

    llm_strategy = LLMExtractionStrategy(
        llm_config=LLMConfig(provider=provider, api_token=api_key),
        schema=ExtractedData.model_json_schema(),
        extraction_type="schema",
        instruction=instruction,
    )

    config = CrawlerRunConfig(
        extraction_strategy=llm_strategy,
        cache_mode=CacheMode.BYPASS,
        verbose=True,
    )

    async with AsyncWebCrawler() as crawler:
        result = await crawler.arun(url=url, config=config)

        if not result.success:
            return {"success": False, "error": result.error_message}

        data = (
            json.loads(result.extracted_content) if result.extracted_content else None
        )

        return {
            "success": True,
            "data": data,
            "status": "completed",
        }
