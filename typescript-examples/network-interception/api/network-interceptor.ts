import { Page, BrowserContext, Request } from "playwright";
import { goToUrl } from "@intuned/browser";
import { attemptStore } from "@intuned/runtime";
import { z } from "zod";
import {
  paramsSchema,
  insureeResponseSchema,
  InsureeResponse,
} from "../utils/typesAndSchemas.js";

type Params = z.infer<typeof paramsSchema>;

async function login(
  page: Page,
  username: string,
  password: string,
  loginUrl: string
): Promise<void> {
  /**
   * Logs in to the website using the provided username and password.
   */
  try {
    console.log(`Navigating to login page: ${loginUrl}`);
    await goToUrl({ page, url: loginUrl });
    await page.waitForLoadState("networkidle");
    // Replace selectors below with your site's login form selectors
    console.log(`Filling login form for user: ${username}`);
    await page.locator("input[type='text']").fill(username);
    await page.locator("input[type='password']").fill(password);
    await page.locator("button[type='submit']").click();
    await page.waitForTimeout(3000);
    console.log("Login completed");
  } catch (e) {
    console.log(`Login failed: ${e}`);
    throw new Error(`Failed to login: ${e}`);
  }
}

async function interceptRequest(request: Request): Promise<void> {
  // Replace "graphql" with the URL pattern that contains CSRF tokens on your site
  if (
    request.url().includes("graphql") &&
    attemptStore.get("csrf_token") === null
  ) {
    // Replace "x-csrftoken" with your site's CSRF header name
    // Common names: "x-csrf-token", "x-xsrf-token", "csrf-token"
    const token = request.headers()["x-csrftoken"];
    if (token) {
      attemptStore.set("csrf_token", token);
      console.log(
        `CSRF token captured: ${attemptStore
          .get("csrf_token")
          ?.slice(0, 20)}...`
      );
    }
  }
}

async function fetchWithCsrf(
  page: Page,
  url: string,
  method: string = "POST",
  body?: Record<string, unknown>,
  headers?: Record<string, string>
): Promise<unknown> {
  // Customize the headers below to match your API requirements
  const fetchScript = `
    async (options) => {
      const { url, method, body, csrfToken, extraHeaders } = options;
      
      const headers = {
        "accept": "*/*",
        "content-type": "application/json",
        "x-csrftoken": csrfToken,
        "x-requested-with": "webapp",
        ...extraHeaders
      };
      
      const fetchOptions = {
        method: method,
        headers: headers,
        credentials: "include",
        mode: "cors"
      };
      
      if (body) {
        fetchOptions.body = JSON.stringify(body);
      }
      
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        throw new Error(\`Request failed: \${response.status} \${response.statusText}\`);
      }
      
      return await response.json();
    }
  `;

  return await page.evaluate(fetchScript, {
    url,
    method,
    body,
    csrfToken: attemptStore.get("csrf_token"),
    extraHeaders: headers || {},
  });
}

/**
 * Intercepts the request to the API and returns the data.
 *
 * Example params:
 * {
 *   "url": "https://demo.openimis.org/front/insuree/insurees",
 *   "api_url": "https://demo.openimis.org/api/graphql",
 *   "query": "{ insurees(first: 10) { edges { node { chfId lastName otherNames dob } } } }",
 *   "username": "Admin",
 *   "password": "admin123"
 * }
 */
async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
): Promise<InsureeResponse> {
  const url = params.url; // URL to navigate after login (where CSRF is captured)
  const apiUrl = params.api_url; // API endpoint to call with CSRF token
  const query = params.query; // GraphQL query or request body
  const username = params.username; // username to use for authentication
  const password = params.password; // password to use for authentication
  const loginUrl = params.login_url || url; // URL to the login page, if not provided, use the main URL

  console.log("Starting network interception automation");
  await login(page, username, password, loginUrl);

  page.on("request", interceptRequest);

  try {
    console.log(`Navigating to: ${url}`);
    await goToUrl({ page, url });
    await page.waitForLoadState("networkidle");

    if (!attemptStore.get("csrf_token")) {
      throw new Error("No CSRF token found");
    }

    if (!query) {
      throw new Error("No query provided, please provide a query to execute");
    }

    console.log(`Making API request to: ${apiUrl}`);
    const data = await fetchWithCsrf(page, apiUrl, "POST", { query });

    console.log(`API request to ${apiUrl} completed successfully`);
    return insureeResponseSchema.parse(data);
  } finally {
    page.removeListener("request", interceptRequest);
    console.log("Request interceptor removed");
  }
}

export default handler;
