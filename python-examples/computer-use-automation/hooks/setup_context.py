from intuned_runtime import attempt_store
from stagehand import Stagehand


async def setup_context(*, api_name: str, api_parameters: str, cdp_url: str):
    if api_name == "api/gemini-computer-use" or api_name == "api/stagehand-template":
        stagehand = Stagehand(
            env="LOCAL", local_browser_launch_options=dict(cdp_url=cdp_url)
        )
        await stagehand.init()
        attempt_store.set("stagehand", stagehand)

        async def cleanup():
            await stagehand.close()

        return stagehand.context, stagehand.page, cleanup

    elif api_name == "api/browser-use-template":
        import os
        os.environ["BROWSER_USE_CONFIG_DIR"] = "/tmp/browseruse-config"
        from browser_use import Browser

        browser = Browser(cdp_url=cdp_url)
        attempt_store.set("browser", browser)
        return

        
        
