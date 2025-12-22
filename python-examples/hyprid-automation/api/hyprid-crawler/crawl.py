import re
from utils.crawler.helpers import get_job_run_id
from playwright.async_api import Page, BrowserContext
from typing import TypedDict
from pydantic import BaseModel

from intuned_browser import go_to_url, save_file_to_s3
from intuned_browser.ai import extract_structured_data
from runtime_helpers import extend_payload
from intuned_runtime import persistent_store
from utils.crawler import (
    extract_links,
    normalize_url,
    get_base_domain,
    is_file_url,
    sanitize_key,
)


# JSON schema for AI extraction of job postings
JOB_POSTING_SCHEMA = {
    "type": "object",
    "properties": {
        "title": {"type": "string", "description": "Job title"},
        "location": {"type": "string", "description": "Job location"},
        "department": {"type": "string", "description": "Department name"},
        "team": {"type": "string", "description": "Team name"},
        "description": {"type": "string", "description": "Full job description"},
        "commitment": {"type": "string", "description": "Employment type (Full-time, Part-time, etc.)"},
        "workplace_type": {"type": "string", "description": "Workplace type (Remote, On-site, Hybrid)"},
        "apply_url": {"type": "string", "description": "URL to apply for the job"},
        "company": {"type": "string", "description": "Company name"},
    },
    "required": ["title"],
}


class JobPosting(BaseModel):
    title: str
    location: str | None = None
    department: str | None = None
    team: str | None = None
    description: str | None = None
    commitment: str | None = None  # Full-time, Part-time, etc.
    workplace_type: str | None = None  # Remote, On-site, Hybrid
    apply_url: str | None = None
    company: str | None = None


# Pattern to match Lever job posting URLs: jobs.lever.co/{company}/{uuid}
# UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
LEVER_JOB_PATTERN = re.compile(
    r"^https?://jobs\.lever\.co/([^/]+)/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})"
)


def is_lever_job_posting(url: str) -> bool:
    """Check if URL is a Lever job posting (not a listing page)."""
    return bool(LEVER_JOB_PATTERN.match(url))


def get_lever_company(url: str) -> str | None:
    """Extract company slug from Lever URL."""
    match = LEVER_JOB_PATTERN.match(url)
    return match.group(1) if match else None


async def extract_lever_job(page: Page, url: str) -> JobPosting:
    """Extract job details from Lever job posting page using Playwright."""
    company = get_lever_company(url)

    # Extract job title from the posting headline
    title = "Unknown Title"
    try:
        title_el = page.locator(".posting-headline h2").first
        title = await title_el.text_content() or title
    except Exception:
        pass

    # Extract location from posting categories
    location = None
    try:
        location_el = page.locator(".posting-categories .location").first
        location = await location_el.text_content()
    except Exception:
        pass

    # Extract department
    department = None
    try:
        dept_el = page.locator(".posting-categories .department").first
        department = await dept_el.text_content()
    except Exception:
        pass

    # Extract team
    team = None
    try:
        team_el = page.locator(".posting-categories .team").first
        team = await team_el.text_content()
    except Exception:
        pass

    # Extract commitment (Full-time, Part-time, etc.)
    commitment = None
    try:
        commitment_el = page.locator(".posting-categories .commitment").first
        commitment = await commitment_el.text_content()
    except Exception:
        pass

    # Extract workplace type (Remote, On-site, Hybrid)
    workplace_type = None
    try:
        workplace_el = page.locator(".posting-categories .workplaceTypes").first
        workplace_type = await workplace_el.text_content()
    except Exception:
        pass

    # Extract job description sections
    description_parts = []

    # Get the main description/intro
    try:
        intro_el = page.locator('[data-qa="job-description"]').first
        intro_text = await intro_el.text_content()
        if intro_text:
            description_parts.append(intro_text.strip())
    except Exception:
        pass

    # Get all posting sections (responsibilities, requirements, etc.)
    try:
        sections = await page.locator(".section.page-centered").all()
        for section in sections:
            # Get section title
            section_title = await section.locator("h3").text_content()
            if section_title:
                description_parts.append(f"\n**{section_title.strip()}**")

            # Get list items in this section
            items = await section.locator("li").all()
            for item in items:
                item_text = await item.text_content()
                if item_text and len(item_text.strip()) > 5:
                    description_parts.append(f"• {item_text.strip()}")
    except Exception:
        pass

    # Get apply URL
    apply_url = url
    try:
        apply_el = page.locator('a.postings-btn[href*="apply"]').first
        apply_href = await apply_el.get_attribute("href")
        if apply_href:
            apply_url = apply_href
    except Exception:
        pass

    return JobPosting(
        title=title.strip() if title else "Unknown Title",
        location=location.strip() if location else None,
        department=department.strip() if department else None,
        team=team.strip() if team else None,
        commitment=commitment.strip() if commitment else None,
        workplace_type=workplace_type.strip() if workplace_type else None,
        description="\n".join(description_parts) if description_parts else None,
        apply_url=apply_url,
        company=company,
    )


class Params(TypedDict, total=False):
    url: str
    max_depth: int
    max_pages: int
    include_external: bool
    include_attachments: bool
    depth: int  # Current depth (internal, set by extend_payload)


async def automation(
    page: Page,
    params: Params,
    _context: BrowserContext | None = None,
    **_kwargs,
):
    """
    Crawl job board URLs and extract structured job posting data.

    This API:
    1. Navigates to the given URL
    2. Extracts job posting data:
       - Lever job postings: uses Playwright selectors (static, fast)
       - Other job pages: uses AI extraction with JobPosting schema
    3. Extracts all internal links
    4. For each new link, extends payload to crawl it (if under depth limit)
    5. Uses persistent_store to deduplicate URLs across all job payloads

    Extraction strategy:
    - Lever (jobs.lever.co/{company}/{uuid}): Static Playwright extraction
    - Greenhouse, other job boards: AI-powered extraction using JobPosting schema

    Example params:
    {
        "url": "https://jobs.lever.co/nordsec",
        "max_depth": 2,
        "max_pages": 50
    }

    Or for Greenhouse:
    {
        "url": "https://job-boards.greenhouse.io/mntn",
        "max_depth": 2,
        "max_pages": 50
    }

    When run as a job, this creates a fan-out pattern:
    - Payload 1: crawl(seed_url) → finds 50 links → extend_payload x 50
    - Payloads 2-51: crawl(link) → each finds more links → extend_payload x N
    - All payloads share the same persistent_store, preventing duplicate work
    """
    url = params["url"]
    max_depth = params.get("max_depth", 2)
    max_pages = params.get("max_pages", 50)
    include_external = params.get("include_external", False)
    include_attachments = params.get("include_attachments", False)
    depth = params.get("depth", 0)

    key_prefix = str(get_job_run_id())
    normalized_url = normalize_url(url)

    # Store config for child payloads (only on first call)
    base_domain = get_base_domain(url)
    if depth == 0:
        await persistent_store.set(f"{key_prefix}__base_domain__", base_domain)
    else:
        base_domain = (
            await persistent_store.get(f"{key_prefix}__base_domain__") or base_domain
        )

    # Deduplicate
    visited_key = sanitize_key(f"{key_prefix}_visited_{normalized_url}")
    if await persistent_store.get(visited_key):
        return {
            "success": True,
            "url": url,
            "skipped": True,
            "reason": "already visited",
        }

    # Page limit check
    page_count = await persistent_store.get(f"{key_prefix}__page_count__") or 0
    if page_count >= max_pages:
        return {
            "success": True,
            "url": url,
            "skipped": True,
            "reason": "max_pages limit reached",
        }

    # Mark as visited and increment counter
    await persistent_store.set(visited_key, True)
    await persistent_store.set(f"{key_prefix}__page_count__", page_count + 1)

    # Navigate
    print(f"[crawl] Depth {depth}/{max_depth}: {url}")
    await go_to_url(page, url)

    # Extract page content
    # Lever job postings: use Playwright selectors (static extraction)
    # Other job pages: use AI extraction with JobPosting schema
    job_posting: JobPosting | None = None
    if is_lever_job_posting(url):
        print(f"[crawl] Detected Lever job posting: {url}")
        job_posting = await extract_lever_job(page, url)
        content = {
            "title": job_posting.title,
            "type": "job_posting",
            "job_data": job_posting.model_dump(),
        }
    else:
        print(f"[crawl] Using AI extraction for: {url}")
        job_data = await extract_structured_data(source=page, data_schema=JOB_POSTING_SCHEMA)
        content = {
            "title": job_data.get("title", "Unknown"),
            "type": "job_posting",
            "job_data": job_data,
        }

    # Find all internal links
    links = await extract_links(page, base_domain, include_external=include_external)
    print(f"[crawl] Found {len(links)} links on {url}")
    attachments = []

    # Queue new links for crawling (if under depth limit)
    links_queued = 0
    next_depth = depth + 1

    if next_depth <= max_depth:
        for link in links:
            if not is_file_url(link):
                # Only queue if not already visited
                link_key = sanitize_key(f"{key_prefix}_visited_{link}")
                if not await persistent_store.get(link_key):
                    extend_payload(
                        {
                            "api": "crawl",
                            "parameters": {
                                "url": link,
                                "depth": next_depth,
                                "include_external": include_external,
                            },
                        }
                    )
                    links_queued += 1
            elif include_attachments:
                try:
                    uploaded = await save_file_to_s3(
                        page=page,
                        trigger=link,
                    )
                    attachments.append(uploaded)
                except Exception as e:
                    print(f"[crawl] Failed to download {link}: {e}")

    return {
        "success": True,
        "url": url,
        "depth": depth,
        "content": content,
        "links_found": len(links),
        "links_queued": links_queued,
        "attachments": attachments,
    }
