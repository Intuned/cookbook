import { Stagehand } from "@browserbasehq/stagehand";
import { attemptStore } from "@intuned/runtime";

async function getWebSocketUrl(cdpUrl: string) {
  console.log("Getting web socket URL from cdpUrl:", cdpUrl);
  // CDP endpoints need /json/version to get the webSocketDebuggerUrl
  const versionUrl = cdpUrl.endsWith('/') ? `${cdpUrl}json/version` : `${cdpUrl}/json/version`;
  const response = await fetch(versionUrl);
  const data = await response.json();
  return data.webSocketDebuggerUrl;
}

export default async function setupContext({
  cdpUrl,
  apiName,
  apiParameters,
}: {
  cdpUrl: string;
  apiName: string;
  apiParameters: any;
}) {
  if (apiName === "api/stagehand" || apiName === "api/gemini-computer-use") {
    const webSocketUrl = await getWebSocketUrl(cdpUrl);
  const stagehand = new Stagehand({
    env: "LOCAL",
    localBrowserLaunchOptions: {
      cdpUrl: webSocketUrl,
      viewport: {
        width: 1280,
        height: 800,
      },
    },
    
    // this is needed since Stagehand uses pino which spawns a worker thread, which is not currently supported in Intuned
    logger: console.log,
  });

  await stagehand.init();

  attemptStore.set("stagehand", stagehand);
}

}
