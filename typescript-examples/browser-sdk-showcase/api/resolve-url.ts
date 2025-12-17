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
  const absoluteUrl1 = await resolveUrl({
    url: "/api/users",
    baseUrl: "https://example.com",
  });
  console.log(absoluteUrl1);

  // Resolve relative URL from the current page
  await page.goto("https://intunedhq.com");
  const absoluteUrl2 = await resolveUrl({
    url: "/blog/intuned-act-3",
    page,
  });
  console.log(absoluteUrl2);

  // Resolve relative URL from an anchor tag
  await page.goto("https://intunedhq.com");
  const absoluteUrl3 = await resolveUrl({
    url: page.locator("a:has-text('Schedule a demo')"),
  });
  console.log(absoluteUrl3);

  return "Success";
}

