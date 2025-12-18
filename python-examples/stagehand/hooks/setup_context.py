from intuned_runtime import attempt_store
from stagehand import Stagehand


async def setup_context(*, api_name: str, api_parameters: str, cdp_url: str):
    stagehand = Stagehand(
        env="LOCAL", local_browser_launch_options=dict(cdp_url=cdp_url, viewport=dict(width=1280, height=800))
    )
    await stagehand.init()
    attempt_store.set("stagehand", stagehand)

    async def cleanup():
        await stagehand.close()

    return stagehand.context, stagehand.page, cleanup

