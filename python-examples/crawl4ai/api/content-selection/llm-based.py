"""
Extract structured data using an LLM with a Pydantic schema.

Uses LLMExtractionStrategy for AI-powered extraction with Intuned AI Gateway.

Based on: https://docs.crawl4ai.com/core/content-selection/
"""

import json
from typing import TypedDict

from intuned_runtime import get_ai_gateway_config
from playwright.async_api import BrowserContext, Page
from pydantic import BaseModel

from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, LLMConfig, LLMExtractionStrategy


class ArticleData(BaseModel):
    headline: str
    summary: str


class Params(TypedDict, total=False):
    url: str
    provider: str


async def automation(
    page: Page,
    params: Params,
    context: BrowserContext | None = None,
    **_kwargs,
):
    url = params.get("url")
    if not url:
        return {"success": False, "error": "url parameter is required"}

    # Get AI gateway config
    base_url, api_key = get_ai_gateway_config()

    provider = params.get("provider", "openai/gpt-4o-mini")

    llm_strategy = LLMExtractionStrategy(
        llm_config=LLMConfig(provider=provider, api_token=api_key, base_url=base_url),
        schema=ArticleData.model_json_schema(),
        extraction_type="schema",
        instruction="Extract 'headline' and a short 'summary' from the content.",
    )

    config = CrawlerRunConfig(
        exclude_external_links=True,
        word_count_threshold=20,
        extraction_strategy=llm_strategy,
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
            "url": result.url,
            "data": data,
        }
