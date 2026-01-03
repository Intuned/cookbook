import { attemptStore } from "@intuned/runtime";

export default async function setupContext({
  cdpUrl,
  apiName,
  apiParameters,
}: {
  cdpUrl: string;
  apiName: string;
  apiParameters: any;
}) {
  attemptStore.set("cdpUrl", cdpUrl);
}
