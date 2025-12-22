import { Page } from "playwright";
import { resolveUrl } from "@intuned/browser";

export function getBaseDomain(url: string): string {
  const parsed = new URL(url);
  return parsed.hostname.toLowerCase();
}

export function normalizeUrl(url: string): string {
  const parsed = new URL(url);
  const path = parsed.pathname.replace(/\/$/, "") || "/";
  return `${parsed.protocol}//${parsed.hostname.toLowerCase()}${path}`;
}

const FILE_EXTENSIONS = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".csv",
  ".zip",
  ".png",
  ".jpg",
]);

export function isFileUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.toLowerCase();
    return Array.from(FILE_EXTENSIONS).some((ext) => path.endsWith(ext));
  } catch {
    return false;
  }
}

export async function extractLinks(
  page: Page,
  baseDomain: string,
  includeExternal: boolean = false
): Promise<string[]> {
  const currentUrl = page.url();

  const hrefs = await page.$$eval("a[href]", (elements) =>
    elements.map((e) => e.getAttribute("href"))
  );

  const links: string[] = [];
  for (const href of hrefs) {
    if (!href) continue;

    if (
      href.startsWith("javascript:") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("#")
    ) {
      continue;
    }

    try {
      const fullUrl = await resolveUrl({ url: href, baseUrl: currentUrl });
      const linkDomain = getBaseDomain(fullUrl);

      if (linkDomain === baseDomain || includeExternal) {
        const normalized = normalizeUrl(fullUrl);
        links.push(normalized);
      }
    } catch (error) {
      console.log(`Failed to resolve URL: ${href}`);
      continue;
    }
  }

  return [...new Set(links)];
}
