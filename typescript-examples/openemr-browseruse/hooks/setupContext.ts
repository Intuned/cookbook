import { attemptStore } from "@intuned/runtime";

export default async function setupContext({
  cdpUrl,
}: {
  cdpUrl: string;
  apiName: string;
  apiParameters: any;
}) {
  attemptStore.set("cdpUrl", cdpUrl);
}
