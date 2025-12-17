import { Stagehand } from "@browserbasehq/stagehand";
import { attemptStore } from "@intuned/runtime";

async function getWebSocketUrl(cdpUrl: string) {
  const versionUrl = cdpUrl.endsWith("/")
    ? `${cdpUrl}json/version`
    : `${cdpUrl}/json/version`;
  const response = await fetch(versionUrl);
  const data = await response.json();
  return data.webSocketDebuggerUrl;
}

export default async function setupContext({
  cdpUrl,
}: {
  cdpUrl: string;
  apiName: string;
  apiParameters: any;
}) {
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
  return {
    cleanup: async () => {
      await stagehand.close();
    },
  }
}
