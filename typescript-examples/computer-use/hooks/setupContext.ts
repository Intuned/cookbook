import { Stagehand, AISdkClient } from "@browserbasehq/stagehand";
import { createOpenAI } from "@ai-sdk/openai";
import { attemptStore, getAiGatewayConfig } from "@intuned/runtime";

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
  if (apiName === "api/stagehand") {
    // Stagehand API uses AI gateway for Anthropic models
    const webSocketUrl = await getWebSocketUrl(cdpUrl);

    const { apiKey, baseUrl } = await getAiGatewayConfig();

    const openai = createOpenAI({
      apiKey,
      baseURL: baseUrl,
    });

    const llmClient = new AISdkClient({
      model: openai("gpt-4o"),
    });

    const stagehand = new Stagehand({
      env: "LOCAL",
      localBrowserLaunchOptions: {
        cdpUrl: webSocketUrl,
        viewport: {
          width: 1280,
          height: 800,
        },
      },
      llmClient,
      logger: console.log,
    });

    await stagehand.init();
    attemptStore.set("stagehand", stagehand);
  } else if (apiName === "api/gemini-computer-use") {
    // Gemini API uses environment variable for API key (AI gateway doesn't support Gemini yet)
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
      logger: console.log,
    });

    await stagehand.init();
    attemptStore.set("stagehand", stagehand);
  }
}
