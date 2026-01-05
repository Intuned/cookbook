import { attemptStore } from "@intuned/runtime";

export default async function setupContext({
  cdpUrl,
}: {
  cdpUrl: string;
  apiName: string;
  apiParameters: any;
}) {
  // Store CDP URL for Stagehand initialization in APIs that need it
  attemptStore.set("cdpUrl", cdpUrl);
}
