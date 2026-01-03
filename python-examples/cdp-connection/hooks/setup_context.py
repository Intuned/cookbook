from intuned_runtime import attempt_store


async def setup_context(*, api_name: str, api_parameters: str, cdp_url: str):
    """
    Setup hook that runs before API execution.
    Captures the CDP URL from Intuned's runtime and stores it in attempt_store.
    """
    attempt_store.set("cdp_url", cdp_url)
