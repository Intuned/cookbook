import { BrowserContext, Page } from "playwright";
import z from "zod";
import { goToUrl, saveFileToS3 } from "@intuned/browser";
import { extractStructuredData, JsonSchema } from "@intuned/browser/ai";
import { extendPayload, persistentStore } from "@intuned/runtime";

import {
  extractLinks,
  normalizeUrl,
  getBaseDomain,
  sanitizeKey,
  getJobRunId,
  isFileUrl,
} from "../../utils/crawler";

// Zod schema for AI extraction of job postings
const jobPostingSchema = z.object({
  title: z.string().describe("Job title"),
  location: z.string().describe("Job location").optional(),
  department: z.string().describe("Department name").optional(),
  team: z.string().describe("Team name").optional(),
  description: z.string().describe("Full job description").optional(),
  commitment: z
    .string()
    .describe("Employment type (Full-time, Part-time, etc.)")
    .optional(),
  workplace_type: z
    .string()
    .describe("Workplace type (Remote, On-site, Hybrid)")
    .optional(),
  apply_url: z.string().describe("URL to apply for the job").optional(),
  company: z.string().describe("Company name").optional(),
});

type JobPosting = z.infer<typeof jobPostingSchema>;

// Convert Zod schema to JSON schema for API compatibility
const JOB_POSTING_SCHEMA: JsonSchema = {
  type: "object",
  properties: {
    title: { type: "string", description: "Job title" },
    location: { type: "string", description: "Job location" },
    department: { type: "string", description: "Department name" },
    team: { type: "string", description: "Team name" },
    description: { type: "string", description: "Full job description" },
    commitment: {
      type: "string",
      description: "Employment type (Full-time, Part-time, etc.)",
    },
    workplace_type: {
      type: "string",
      description: "Workplace type (Remote, On-site, Hybrid)",
    },
    apply_url: { type: "string", description: "URL to apply for the job" },
    company: { type: "string", description: "Company name" },
  },
  required: ["title"],
};

// Pattern to match Lever job posting URLs: jobs.lever.co/{company}/{uuid}
const LEVER_JOB_PATTERN =
  /^https?:\/\/jobs\.lever\.co\/([^/]+)\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/;

function isLeverJobPosting(url: string): boolean {
  return LEVER_JOB_PATTERN.test(url);
}

function getLeverCompany(url: string): string | null {
  const match = url.match(LEVER_JOB_PATTERN);
  return match ? match[1] : null;
}

async function extractLeverJob(page: Page, url: string): Promise<JobPosting> {
  const company = getLeverCompany(url);

  // Extract job title from the posting headline
  let title = "Unknown Title";
  try {
    const titleEl = page.locator(".posting-headline h2").first();
    title = (await titleEl.textContent()) || title;
  } catch {
    // ignore
  }

  // Extract location from posting categories
  let location: string | undefined;
  try {
    const locationEl = page.locator(".posting-categories .location").first();
    location = (await locationEl.textContent()) || undefined;
  } catch {
    // ignore
  }

  // Extract department
  let department: string | undefined;
  try {
    const deptEl = page.locator(".posting-categories .department").first();
    department = (await deptEl.textContent()) || undefined;
  } catch {
    // ignore
  }

  // Extract team
  let team: string | undefined;
  try {
    const teamEl = page.locator(".posting-categories .team").first();
    team = (await teamEl.textContent()) || undefined;
  } catch {
    // ignore
  }

  // Extract commitment (Full-time, Part-time, etc.)
  let commitment: string | undefined;
  try {
    const commitmentEl = page
      .locator(".posting-categories .commitment")
      .first();
    commitment = (await commitmentEl.textContent()) || undefined;
  } catch {
    // ignore
  }

  // Extract workplace type (Remote, On-site, Hybrid)
  let workplace_type: string | undefined;
  try {
    const workplaceEl = page
      .locator(".posting-categories .workplaceTypes")
      .first();
    workplace_type = (await workplaceEl.textContent()) || undefined;
  } catch {
    // ignore
  }

  // Extract job description sections
  const descriptionParts: string[] = [];

  // Get the main description/intro
  try {
    const introEl = page.locator('[data-qa="job-description"]').first();
    const introText = await introEl.textContent();
    if (introText) {
      descriptionParts.push(introText.trim());
    }
  } catch {
    // ignore
  }

  // Get all posting sections (responsibilities, requirements, etc.)
  try {
    const sections = await page.locator(".section.page-centered").all();
    for (const section of sections) {
      const sectionTitle = await section.locator("h3").textContent();
      if (sectionTitle) {
        descriptionParts.push(`\n**${sectionTitle.trim()}**`);
      }

      const items = await section.locator("li").all();
      for (const item of items) {
        const itemText = await item.textContent();
        if (itemText && itemText.trim().length > 5) {
          descriptionParts.push(`• ${itemText.trim()}`);
        }
      }
    }
  } catch {
    // ignore
  }

  // Get apply URL
  let apply_url = url;
  try {
    const applyEl = page.locator('a.postings-btn[href*="apply"]').first();
    const applyHref = await applyEl.getAttribute("href");
    if (applyHref) {
      apply_url = applyHref;
    }
  } catch {
    // ignore
  }

  return {
    title: title?.trim() || "Unknown Title",
    location: location?.trim(),
    department: department?.trim(),
    team: team?.trim(),
    commitment: commitment?.trim(),
    workplace_type: workplace_type?.trim(),
    description: descriptionParts.length > 0 ? descriptionParts.join("\n") : undefined,
    apply_url,
    company: company || undefined,
  };
}

interface Params {
  url: string;
  max_depth?: number;
  max_pages?: number;
  include_external?: boolean;
  include_attachments?: boolean;
  depth?: number;
}

/**
 * Crawl job board URLs and extract structured job posting data.
 *
 * This API:
 * 1. Navigates to the given URL
 * 2. Extracts job posting data:
 *    - Lever job postings: uses Playwright selectors (static, fast)
 *    - Other job pages: uses AI extraction with JobPosting schema
 * 3. Extracts all internal links
 * 4. For each new link, extends payload to crawl it (if under depth limit)
 * 5. Uses persistentStore to deduplicate URLs across all job payloads
 *
 * Extraction strategy:
 * - Lever (jobs.lever.co/{company}/{uuid}): Static Playwright extraction
 * - Greenhouse, other job boards: AI-powered extraction using JobPosting schema
 */
export default async function handler(
  params: Params,
  page: Page,
  _context: BrowserContext
) {
  const url = params.url;
  const maxDepth = params.max_depth ?? 2;
  const maxPages = params.max_pages ?? 50;
  const includeExternal = params.include_external ?? false;
  const includeAttachments = params.include_attachments ?? false;
  const depth = params.depth ?? 0;

  const keyPrefix = `${getJobRunId()}`;
  const normalizedUrl = normalizeUrl(url);

  // Store config for child payloads (only on first call)
  let baseDomain = getBaseDomain(url);
  if (depth === 0) {
    await persistentStore.set(`${keyPrefix}__base_domain__`, baseDomain);
  } else {
    baseDomain =
      (await persistentStore.get(`${keyPrefix}__base_domain__`)) || baseDomain;
  }

  // Deduplicate
  const visitedKey = sanitizeKey(`${keyPrefix}_visited_${normalizedUrl}`);
  if (await persistentStore.get(visitedKey)) {
    return {
      success: true,
      url,
      skipped: true,
      reason: "already visited",
    };
  }

  // Page limit check
  const pageCount =
    (await persistentStore.get(`${keyPrefix}__page_count__`)) || 0;
  if (pageCount >= maxPages) {
    return {
      success: true,
      url,
      skipped: true,
      reason: "max_pages limit reached",
    };
  }

  // Mark as visited and increment counter
  await persistentStore.set(visitedKey, true);
  await persistentStore.set(`${keyPrefix}__page_count__`, pageCount + 1);

  // Navigate
  console.log(`[crawl] Depth ${depth}/${maxDepth}: ${url}`);
  await goToUrl({ page, url });

  // Extract page content
  // Lever job postings: use Playwright selectors (static extraction)
  // Other job pages: use AI extraction with JobPosting schema
  let content: {
    title: string;
    type: string;
    job_data: JobPosting | Record<string, unknown>;
  };

  if (isLeverJobPosting(url)) {
    console.log(`[crawl] Detected Lever job posting: ${url}`);
    const jobPosting = await extractLeverJob(page, url);
    content = {
      title: jobPosting.title,
      type: "job_posting",
      job_data: jobPosting,
    };
  } else {
    console.log(`[crawl] Using AI extraction for: ${url}`);
    const jobData = await extractStructuredData({
      source: page,
      dataSchema: JOB_POSTING_SCHEMA,
      model: "gpt-5-mini",
    });
    content = {
      title: (jobData as Record<string, unknown>).title as string || "Unknown",
      type: "job_posting",
      job_data: jobData as Record<string, unknown>,
    };
  }

  // Find all internal links
  const links = await extractLinks(page, baseDomain, includeExternal);
  console.log(`[crawl] Found ${links.length} links on ${url}`);

  // Queue new links for crawling (if under depth limit)
  let linksQueued = 0;
  const nextDepth = depth + 1;
  const attachments: unknown[] = [];

  if (nextDepth <= maxDepth) {
    for (const link of links) {
      if (!isFileUrl(link)) {
        // Only queue if not already visited
        const linkKey = sanitizeKey(`${keyPrefix}_visited_${link}`);
        if (!(await persistentStore.get(linkKey))) {
          extendPayload({
            api: "hybrid-crawler/crawl",
            parameters: {
              url: link,
              depth: nextDepth,
              include_external: includeExternal,
            },
          });
          linksQueued++;
        }
      } else if (includeAttachments) {
        try {
          const uploaded = await saveFileToS3({
            page,
            trigger: link,
          });
          attachments.push(uploaded);
        } catch (e) {
          console.log(`[crawl] Failed to download ${link}: ${e}`);
        }
      }
    }
  }

  return {
    success: true,
    url,
    depth,
    content,
    links_found: links.length,
    links_queued: linksQueued,
    attachments,
  };
}
