from crawl4ai.async_configs import BrowserConfig


# Mobile Chrome user agent
MOBILE_USER_AGENT = (
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) "
    "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
)

# Default viewport dimensions
MOBILE_VIEWPORT = (390, 844)
DESKTOP_VIEWPORT = (1280, 720)


def create_browser_config(
    mobile: bool = False,
    headers: dict[str, str] | None = None,
    skip_tls_verification: bool = True,
    headless: bool = True,
    verbose: bool = True,
) -> BrowserConfig:
    """
    Create a BrowserConfig with common settings.

    Args:
        mobile: If True, use mobile viewport and user agent
        headers: Optional custom HTTP headers
        skip_tls_verification: Skip TLS certificate verification
        headless: Run browser in headless mode
        verbose: Enable verbose logging

    Returns:
        Configured BrowserConfig instance
    """
    viewport = MOBILE_VIEWPORT if mobile else DESKTOP_VIEWPORT

    return BrowserConfig(
        headless=headless,
        viewport_width=viewport[0],
        viewport_height=viewport[1],
        user_agent=MOBILE_USER_AGENT if mobile else None,
        headers=headers if headers else None,
        ignore_https_errors=skip_tls_verification,
        verbose=verbose,
    )
