from intuned_browser import go_to_url, wait_for_network_settled
from intuned_runtime import attempt_store
from playwright.async_api import BrowserContext, Page, Request
from utils.types_and_schemas import Consultation, NetworkInterceptorParams

# Supabase project base URL for sandbox.intuned.dev
SUPABASE_URL = "https://pfaqkmnqacbiimndjwyp.supabase.co"


async def login(page: Page, email: str, password: str) -> None:
    """Log in to sandbox.intuned.dev with the given credentials."""
    login_url = "https://sandbox.intuned.dev/login"
    print(f"Navigating to login page: {login_url}")
    await go_to_url(page, login_url)
    await page.locator("input[type='email']").fill(email)
    await page.locator("input[type='password']").fill(password)
    await page.locator("button[type='submit']").click()
    print("Login form submitted")
    await page.wait_for_timeout(3000)


async def intercept_request(request: Request) -> None:
    """Capture the Bearer token, anon key, and user ID from Supabase API requests."""
    if SUPABASE_URL not in request.url:
        return

    if attempt_store.get("bearer_token") is None:
        auth_header = request.headers.get("authorization", "")
        user_id_header = request.headers.get("x-user-id", "")

        if auth_header.startswith("Bearer "):
            token = auth_header[len("Bearer "):]
            attempt_store.set("bearer_token", token)
            print(f"Bearer token captured: {token[:20]}...")

        # Extract user_id from the consultations URL pattern if present
        if "/consultations" in request.url and "user_id=eq." in request.url:
            uid = request.url.split("user_id=eq.")[1].split("&")[0]
            attempt_store.set("user_id", uid)
            print(f"User ID captured: {uid}")
        elif user_id_header:
            attempt_store.set("user_id", user_id_header)

    if attempt_store.get("anon_key") is None:
        anon_key = request.headers.get("apikey")
        if anon_key:
            attempt_store.set("anon_key", anon_key)
            print(f"Anon key captured: {anon_key[:20]}...")


async def automation(
    page: Page,
    params: NetworkInterceptorParams,
    context: BrowserContext | None = None,
    **_kwargs,
) -> list[Consultation]:
    """
    Logs in to sandbox.intuned.dev, intercepts a Supabase API request to capture
    the Bearer token, then fetches consultations from the Supabase REST API.

    Example parameters:
    {
        "username": "demo@email.com",
        "password": "demo123",
        "limit": 5
    }
    """
    params = NetworkInterceptorParams(**params)
    attempt_store.set("bearer_token", None)
    attempt_store.set("anon_key", None)
    attempt_store.set("user_id", None)

    await login(page, params.username, params.password)

    # Attach interceptor and navigate to a page that triggers authenticated Supabase calls
    page.on("request", intercept_request)

    try:
        print("Navigating to consultations page to capture API token...")
        await wait_for_network_settled(
            page=page,
            func=lambda: go_to_url(page, "https://sandbox.intuned.dev/consultations-auth/list"),
            timeout_s=20,
        )

        # Poll until the token is captured (up to 10 seconds)
        for _ in range(20):
            if attempt_store.get("bearer_token"):
                break
            await page.wait_for_timeout(500)

        bearer_token = attempt_store.get("bearer_token")
        anon_key = attempt_store.get("anon_key")
        user_id = attempt_store.get("user_id")

        if not bearer_token:
            raise ValueError("Failed to capture Bearer token — check credentials or page selectors")
        if not anon_key:
            raise ValueError("Failed to capture Supabase anon key from network")

        api_url = (
            f"{SUPABASE_URL}/rest/v1/consultations"
            f"?select=*"
            f"&user_id=eq.{user_id}"
            f"&order=created_at.desc"
            f"&offset=0"
            f"&limit={params.limit}"
        )

        print(f"Fetching consultations from Supabase: {api_url}")

        result = await page.evaluate(
            """
            async (options) => {
                const { url, bearerToken, anonKey } = options;
                const response = await fetch(url, {
                    headers: {
                        "accept": "*/*",
                        "accept-profile": "public",
                        "apikey": anonKey,
                        "authorization": "Bearer " + bearerToken,
                        "prefer": "count=exact"
                    }
                });
                if (!response.ok) {
                    throw new Error("Request failed: " + response.status + " " + response.statusText);
                }
                return await response.json();
            }
            """,
            {"url": api_url, "bearerToken": bearer_token, "anonKey": anon_key},
        )

        print(f"Fetched {len(result)} consultations")
        return [Consultation(**item) for item in result]

    finally:
        page.remove_listener("request", intercept_request)
        print("Request interceptor removed")
