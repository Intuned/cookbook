// https://docs.intunedhq.com/automation-sdks/intuned-sdk/typescript/helpers/functions/processDate
import { BrowserContext, Page } from "playwright";
import { processDate } from "@intuned/browser";

interface Params {
  // No params needed
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  // Basic date string
  const date1 = processDate({ date: "22/11/2024" });
  console.log("Result of processing 22/11/2024:");
  console.log(date1); // 2024-11-22 00:00:00

  // Single-digit variant
  const date2 = processDate({ date: "8/16/2019" });
  console.log("Result of processing 8/16/2019:");
  console.log(date2); // 2019-08-16 00:00:00

  // Date with time (time is ignored)
  const date3 = processDate({ date: "12/09/2024 9:00 AM" });
  console.log("Result of processing 12/09/2024 9:00 AM:");
  console.log(date3); // 2024-12-09 00:00:00

  // With timezone
  const date4 = processDate({ date: "10/23/2024 12:06 PM CST" });
  console.log("Result of processing 10/23/2024 12:06 PM CST:");
  console.log(date4); // 2024-10-23 00:00:00

  // Full month format
  const date5 = processDate({ date: "November 14, 2024" });
  console.log("Result of processing November 14, 2024:");
  console.log(date5); // 2024-11-14 00:00:00

  return {
    date1: date1.toISOString(),
    date2: date2.toISOString(),
    date3: date3.toISOString(),
    date4: date4.toISOString(),
    date5: date5.toISOString(),
  };
}

