import { attemptStore } from "@intuned/runtime";

/**
 * Runs before every API attempt. Stores the browser's CDP URL in the
 * attemptStore so APIs that attach an external driver (Stagehand, used by the
 * ai-fallback helper) can connect to the SAME browser / auth session the
 * attempt is running in.
 */
export default async function setupContext({
  cdpUrl,
}: {
  cdpUrl: string;
  apiName: string;
  apiParameters: any;
}) {
  attemptStore.set("cdpUrl", cdpUrl);
}
