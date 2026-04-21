import { BrowserContext, Page } from "playwright";
import { goToUrl } from "@intuned/browser";

interface Params {
  url: string;
}

export default async function handler(
  params: Params,
  page: Page,
  _context: BrowserContext
) {
  await goToUrl({ page, url: params.url });

  const baseHost = new URL(params.url).host;

  const links = await page.$$eval("a[href]", (anchors) =>
    anchors
      .map((a) => (a as HTMLAnchorElement).href)
      .filter((h) => h.startsWith("http"))
  );

  const unique = Array.from(new Set(links));
  const internal = unique.filter((h) => {
    try {
      return new URL(h).host === baseHost;
    } catch {
      return false;
    }
  });

  return {
    url: params.url,
    totalLinks: unique.length,
    internalLinks: internal.length,
    links: internal.slice(0, 50),
  };
}
