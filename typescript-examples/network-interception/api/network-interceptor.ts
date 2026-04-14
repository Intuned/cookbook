import { Page, BrowserContext, Request } from "playwright";
import { goToUrl, withNetworkSettledWait } from "@intuned/browser";
import { attemptStore } from "@intuned/runtime";
import { z } from "zod";
import {
  paramsSchema,
  consultationSchema,
} from "../utils/typesAndSchemas";

type Params = z.infer<typeof paramsSchema>;
type Consultation = z.infer<typeof consultationSchema>;

const SUPABASE_URL = "https://pfaqkmnqacbiimndjwyp.supabase.co";

async function login(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  const loginUrl = "https://sandbox.intuned.dev/login";
  console.log(`Navigating to login page: ${loginUrl}`);
  await goToUrl({ page, url: loginUrl });
  await page.locator("input[type='email']").fill(email);
  await page.locator("input[type='password']").fill(password);
  await page.locator("button[type='submit']").click();
  console.log("Login form submitted");
  await page.waitForTimeout(3000);
}

async function interceptRequest(request: Request): Promise<void> {
  if (!request.url().includes(SUPABASE_URL)) return;

  if (attemptStore.get("bearer_token") === null) {
    const authHeader = request.headers()["authorization"] ?? "";
    const userIdHeader = request.headers()["x-user-id"] ?? "";

    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice("Bearer ".length);
      attemptStore.set("bearer_token", token);
      console.log(`Bearer token captured: ${token.slice(0, 20)}...`);
    }

    // Extract user_id from the consultations URL pattern if present
    if (
      request.url().includes("/consultations") &&
      request.url().includes("user_id=eq.")
    ) {
      const uid = request.url().split("user_id=eq.")[1].split("&")[0];
      attemptStore.set("user_id", uid);
      console.log(`User ID captured: ${uid}`);
    } else if (userIdHeader) {
      attemptStore.set("user_id", userIdHeader);
    }
  }

  if (attemptStore.get("anon_key") === null) {
    const anonKey = request.headers()["apikey"];
    if (anonKey) {
      attemptStore.set("anon_key", anonKey);
      console.log(`Anon key captured: ${anonKey.slice(0, 20)}...`);
    }
  }
}

/**
 * Logs in to sandbox.intuned.dev, intercepts Supabase requests to capture
 * the Bearer token and anon key, then fetches consultations via the REST API.
 *
 * Example params:
 * {
 *   "username": "demo@email.com",
 *   "password": "DemoUser2024!",
 *   "limit": 5
 * }
 */
async function handler(
  params: Params,
  page: Page,
  _context: BrowserContext
): Promise<Consultation[]> {
  attemptStore.set("bearer_token", null);
  attemptStore.set("anon_key", null);
  attemptStore.set("user_id", null);

  await login(page, params.username, params.password);

  page.on("request", interceptRequest);

  try {
    console.log("Navigating to consultations page to capture API credentials...");
    await withNetworkSettledWait(
      async (page) => {
        await goToUrl({ page, url: "https://sandbox.intuned.dev/consultations-auth/list" });
      },
      { page, timeoutInMs: 20000 }
    );

    // Poll until both token and anon key are captured (up to 10 seconds)
    for (let i = 0; i < 20; i++) {
      if (attemptStore.get("bearer_token") && attemptStore.get("anon_key")) break;
      await page.waitForTimeout(500);
    }

    const bearerToken = attemptStore.get("bearer_token") as string | null;
    const anonKey = attemptStore.get("anon_key") as string | null;
    const userId = attemptStore.get("user_id") as string | null;

    if (!bearerToken) {
      throw new Error("Failed to capture Bearer token — check credentials");
    }
    if (!anonKey) {
      throw new Error("Failed to capture Supabase anon key from network");
    }

    const apiUrl =
      `${SUPABASE_URL}/rest/v1/consultations` +
      `?select=*` +
      `&user_id=eq.${userId}` +
      `&order=created_at.desc` +
      `&offset=0` +
      `&limit=${params.limit}`;

    console.log(`Fetching consultations from Supabase: ${apiUrl}`);

    const result = await page.evaluate(
      async (options: { url: string; bearerToken: string; anonKey: string }) => {
        const response = await fetch(options.url, {
          headers: {
            accept: "*/*",
            "accept-profile": "public",
            apikey: options.anonKey,
            authorization: `Bearer ${options.bearerToken}`,
            prefer: "count=exact",
          },
        });
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status} ${response.statusText}`);
        }
        return response.json();
      },
      { url: apiUrl, bearerToken, anonKey }
    );

    const consultations = (result as unknown[]).map((item) =>
      consultationSchema.parse(item)
    );
    console.log(`Fetched ${consultations.length} consultations`);
    return consultations;
  } finally {
    page.removeListener("request", interceptRequest);
    console.log("Request interceptor removed");
  }
}

export default handler;
