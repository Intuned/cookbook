from playwright.async_api import Page, BrowserContext, Request
from typing import Optional, Any, Dict
from intuned_browser import go_to_url
from intuned_runtime import attempt_store
from utils.types_and_schemas import NetworkInterceptorParams, InsureeResponse

attempt_store.set("csrf_token", None)


async def login(page: Page, username: str, password: str, login_url: str) -> None:
    """
    Logs in to the website using the provided username and password.
    Args:
        page: Playwright page instance
        username: Username to use for authentication
        password: Password to use for authentication
        login_url: URL to the login page
    """
    try:
        print(f"Navigating to login page: {login_url}")
        await go_to_url(page, login_url)
        await page.wait_for_load_state("networkidle")
        # Replace selectors below with your site's login form selectors
        print(f"Filling login form for user: {username}")
        await page.locator("input[type='text']").fill(username)
        await page.locator("input[type='password']").fill(password)
        await page.locator("button[type='submit']").click()
        await page.wait_for_timeout(3000)
        print("Login completed")
    except Exception as e:
        print(f"Login failed: {e}")
        raise ValueError(f"Failed to login: {e}")


async def intercept_request(request: Request) -> None:
    # Replace "graphql" with the URL pattern that contains CSRF tokens on your site
    if "graphql" in request.url and attempt_store.get("csrf_token") is None:
        # Replace "x-csrftoken" with your site's CSRF header name
        # Common names: "x-csrf-token", "x-xsrf-token", "csrf-token"
        token = request.headers.get("x-csrftoken")
        if token:
            attempt_store.set("csrf_token", token)
            print(f"CSRF token captured: {attempt_store.get('csrf_token')[:20]}...")


async def fetch_with_csrf(
    page: Page,
    url: str,
    method: str = "POST",
    body: Optional[Dict[str, Any]] = None,
    headers: Optional[Dict[str, str]] = None,
) -> Any:
    # Customize the headers below to match your API requirements
    fetch_script = """
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
                throw new Error(`Request failed: ${response.status} ${response.statusText}`);
            }
            
            return await response.json();
        }
    """

    return await page.evaluate(
        fetch_script,
        {
            "url": url,
            "method": method,
            "body": body,
            "csrfToken": attempt_store.get("csrf_token"),
            "extraHeaders": headers or {},
        },
    )


async def automation(
    page: Page,
    params: NetworkInterceptorParams,
    context: BrowserContext | None = None,
    **_kwargs,
) -> InsureeResponse:
    """
    Intercepts the request to the API and returns the data.
    Args:
        page: Playwright page instance
        params: Parameters for the automation
        context: Playwright browser context instance
    Returns:
        Dict[str, Any]: The data from the API
    Example Parameters:
    {
        "url": "https://demo.openimis.org/front/",
        "api_url": "https://demo.openimis.org/api/graphql",
        "query": "{ insurees(first: 10) { edges { node { chfId lastName otherNames dob } } } }",
        "username": "Admin",
        "password": "admin123",
    }
    """

    params = NetworkInterceptorParams(**params)
    url = params.url  # URL to navigate after login (where CSRF is captured)
    api_url = params.api_url  # API endpoint to call with CSRF token
    query = params.query  # GraphQL query or request body
    username = params.username  # username to use for authentication
    password = params.password  # password to use for authentication
    login_url = (
        params.login_url or url
    )  # URL to the login page, if not provided, use the main URL

    print("Starting network interception automation")
    await login(page, username, password, login_url)

    page.on("request", intercept_request)

    try:
        print(f"Navigating to: {url}")
        await go_to_url(page, url)
        await page.wait_for_load_state("networkidle")

        if not attempt_store.get("csrf_token"):
            raise ValueError("No CSRF token found")

        if not query:
            raise ValueError("No query provided, please provide a query to execute")

        print(f"Making API request to: {api_url}")
        data = await fetch_with_csrf(
            page=page,
            url=api_url,
            method="POST",
            body={"query": query},
        )

        print(f"API request to {api_url} completed successfully")
        return InsureeResponse(**data)

    finally:
        page.remove_listener("request", intercept_request)
        print("Request interceptor removed")
