from intuned_runtime import attempt_store


async def setup_context(*, api_name: str, api_parameters: str, cdp_url: str):
    from browser_use import Browser

    browser = Browser(cdp_url=cdp_url)
    attempt_store.set("browser", browser)
    return
