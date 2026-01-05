// https://docs.intunedhq.com/automation-sdks/intuned-sdk/typescript/helpers/functions/resolveUrl
import { BrowserContext, Page } from "playwright";
import { resolveUrl } from "@intuned/browser";

interface Params {
  // No params needed
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  // Resolve a relative URL to an absolute URL
  const urlWithBase = await resolveUrl({
    url: "/api/users",
    baseUrl: "https://example.com",
  });
  console.log("Result of resolving relative URL to absolute URL:");
  console.log(urlWithBase);

  // Resolve relative URL from the current page
  await page.goto("https://intunedhq.com");
  const urlFromPage = await resolveUrl({
    url: "/blog/intuned-act-3",
    page,
  });
  console.log("Result of resolving relative URL from the current page:");
  console.log(urlFromPage);

  // Resolve relative URL from an anchor tag
  await page.goto("https://intunedhq.com");
  const urlFromAnchor = await resolveUrl({
    url: page.locator("a:has-text('Schedule a demo')"),
  });
  console.log("Result of resolving relative URL from an anchor tag:");
  console.log(urlFromAnchor);

  return {
    url_with_base: urlWithBase,
    url_from_page: urlFromPage,
    url_from_anchor: urlFromAnchor,
  };
}

