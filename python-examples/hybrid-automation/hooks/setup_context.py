from intuned_runtime import attempt_store


async def setup_context(*, api_name: str, api_parameters: str, cdp_url: str):


    # Store CDP URL for Stagehand initialization in APIs that need it
    attempt_store.set("cdp_url", cdp_url)


