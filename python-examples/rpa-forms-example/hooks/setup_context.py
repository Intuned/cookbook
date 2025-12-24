from intuned_runtime import attempt_store


async def setup_context(*, api_name: str, api_parameters: str, cdp_url: str):
    attempt_store.set("cdp_url", cdp_url)
