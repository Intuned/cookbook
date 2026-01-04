import platform

import httpx
from intuned_browser import go_to_url
from intuned_runtime import attempt_store
from playwright.async_api import Page
from pydantic import ValidationError
from utils.types_and_schemas import (
    BrowserInfo,
    CDPConnectionResult,
    ConnectToCdpParams,
    PageInfo,
    WebDriverInfo,
)


async def get_browser_info(cdp_url: str) -> BrowserInfo:
    """
    Fetches browser information from the CDP endpoint
    """
    version_url = (
        f"{cdp_url}json/version" if cdp_url.endswith("/") else f"{cdp_url}/json/version"
    )

    async with httpx.AsyncClient() as client:
        response = await client.get(version_url)
        data = response.json()

    return BrowserInfo(
        browser_version=data["Browser"],
        protocol_version=data["Protocol-Version"],
        user_agent=data["User-Agent"],
        web_socket_debugger_url=data["webSocketDebuggerUrl"],
    )


async def automation(page: Page, params: dict | None = None, **_kwargs) -> dict:
    """
    CDP Connection Example

    This function demonstrates how to:
    1. Get CDP URL from Intuned runtime
    2. Fetch browser information via CDP
    3. Use Playwright with existing CDP connection
    4. Navigate and extract page information
    """
    print("=== CDP Connection Example ===\n")

    # Validate parameters using Pydantic schema
    if not params:
        raise ValueError("Missing required parameters")

    try:
        validated_params = ConnectToCdpParams(**params)
    except ValidationError as e:
        errors = ", ".join([f"{err['loc'][0]}: {err['msg']}" for err in e.errors()])
        raise ValueError(f"Parameter validation failed: {errors}")

    url = validated_params.url

    # Get CDP URL from Intuned's runtime (provided via setup_context hook)
    cdp_url = attempt_store.get("cdp_url")
    if not cdp_url:
        raise ValueError("CDP URL not found in attempt_store")

    print(f"✓ CDP URL: {cdp_url}")

    # Step 1: Fetch browser information via CDP
    browser_info = await get_browser_info(cdp_url)
    print("\n✓ Browser Information:")
    print(f"  - Browser Version: {browser_info.browser_version}")
    print(f"  - Protocol Version: {browser_info.protocol_version}")
    print(f"  - User Agent: {browser_info.user_agent}")
    print(f"  - WebSocket URL: {browser_info.web_socket_debugger_url}")

    # Step 2: Get WebDriver capabilities using CDP
    # Create a CDP session to execute CDP commands
    cdp_session = await page.context.new_cdp_session(page)

    print("\n✓ WebDriver Information:")
    print("  WebDriver is a W3C standard protocol for browser automation.")
    print("  CDP (Chrome DevTools Protocol) is Chrome-specific and more powerful.")

    # Get browser capabilities through CDP
    browser_capabilities = await cdp_session.send("Browser.getVersion")

    web_driver_info = WebDriverInfo(
        capabilities={
            "browserName": "chromium",
            "browserVersion": browser_capabilities["product"],
            "platformName": platform.system(),
            "cdpEnabled": True,
            "webDriverBiDiSupported": False,  # Playwright uses CDP, not WebDriver BiDi
        },
        session_id=None,  # CDP doesn't use WebDriver session IDs
    )

    print(f"  - Browser Name: {web_driver_info.capabilities['browserName']}")
    print(f"  - Browser Version: {web_driver_info.capabilities['browserVersion']}")
    print(f"  - Platform: {web_driver_info.capabilities['platformName']}")
    print(f"  - CDP Enabled: {web_driver_info.capabilities['cdpEnabled']}")
    print(
        f"  - WebDriver BiDi: {web_driver_info.capabilities['webDriverBiDiSupported']}"
    )

    # Close CDP session
    await cdp_session.detach()

    # Step 3: Use the Playwright page (already connected via CDP)
    # The page object is already connected to the browser via CDP
    print("\n✓ Playwright page is ready and connected via CDP")

    # Step 4: Navigate to a URL
    print(f"\n✓ Navigating to: {url}")
    await go_to_url(page, url)

    # Step 5: Get page information
    title = await page.title()
    current_url = page.url

    page_info = PageInfo(
        title=title,
        url=current_url,
    )

    print("\n✓ Page Information:")
    print(f"  - Title: {page_info.title}")
    print(f"  - URL: {page_info.url}")
    print(f"  - Viewport: {page_info.viewport.width}x{page_info.viewport.height}")

    print("\n✓ CDP connection successful!\n")

    result = CDPConnectionResult(
        message="Successfully connected to browser via CDP and retrieved information",
        cdp_url=cdp_url,
        browser_info=browser_info,
        page_info=page_info,
        web_driver_info=web_driver_info,
    )

    # Use mode='json' to serialize all Pydantic types to JSON-compatible primitives
    return result.model_dump(mode="json")
