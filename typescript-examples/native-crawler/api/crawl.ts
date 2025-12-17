import { BrowserContext, Page } from "playwright";
import { goToUrl, saveFileToS3 } from "@intuned/browser";
import { extendPayload } from "@intuned/runtime";
import { persistentStore } from "@intuned/runtime";

import {
  extractLinks,
  extractPageContent,
  normalizeUrl,
  getBaseDomain,
  sanitizeKey,
  getJobRunId,
  isFileUrl,
} from "../utils/index";

interface Params {
  url: string;
  max_depth?: number;
  max_pages?: number;
  include_external?: boolean;
  include_attachments?: boolean;
  schema?: any;
  depth?: number; // Current depth (internal, set by extend_payload)
}



export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  /**
   * Crawl a URL: extract content and discover links.
   *
   * This API:
   * 1. Navigates to the given URL
   * 2. Extracts the page content as markdown
   * 3. Extracts all internal links
   * 4. For each new link, extends payload to crawl it (if under depth limit)
   * 5. Uses persistent_store to deduplicate URLs across all job payloads
   *
   * Example params:
   * {
   *   "url": "https://books.toscrape.com",
   *   "max_depth": 2,
   *   "max_pages": 50
   * }
   *
   * When run as a job, this creates a fan-out pattern:
   * - Payload 1: crawl(seed_url) → finds 50 links → extend_payload x 50
   * - Payloads 2-51: crawl(link) → each finds more links → extend_payload x N
   * - All payloads share the same persistent_store, preventing duplicate work
   */
  const url = params.url;
  const maxDepth = params.max_depth ?? 2;
  const maxPages = params.max_pages ?? 50;
  const includeExternal = params.include_external ?? false;
  const includeAttachments = params.include_attachments ?? false;
  const schema = params.schema;
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
  const pageCount = (await persistentStore.get(`${keyPrefix}__page_count__`)) || 0;
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
  const content = await extractPageContent(page, schema);

  // Find all internal links
  const links = await extractLinks(page, baseDomain, includeExternal);
  console.log(`[crawl] Found ${links.length} links on ${url}`);

  // Queue new links for crawling (if under depth limit)
  let linksQueued = 0;
  const nextDepth = depth + 1;
  const attachments: any[] = [];

  if (nextDepth <= maxDepth) {
    for (const link of links) {
      if (!isFileUrl(link)) {
        // Only queue if not already visited
        const linkKey = sanitizeKey(`${keyPrefix}_visited_${link}`);
        if (!(await persistentStore.get(linkKey))) {
          extendPayload({
            api: "crawl",
            parameters: {
              url: link,
              depth: nextDepth,
              include_external: includeExternal,
              schema,
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
          attachments.push({
            url: link,
            s3_key: uploaded.getS3Key(),
            signed_url: await uploaded.getSignedUrl(),
          });
        } catch (e) {
          console.log(`[crawl] Failed to download ${link}: ${e}`);
        }
      }
    }
  }

  // Return page data + crawl stats
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
