import { BrowserContext, Page } from "playwright";
import { filterEmptyValues } from "@intuned/browser";

interface Params {
  // No params needed
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  // Filter empty values from dictionary
  const result1 = filterEmptyValues({ data: { a: "", b: "hello", c: null } });
  console.log(result1);

  // Filter empty values from list
  const result2 = filterEmptyValues({ data: [1, "", null, [2, ""]] });
  console.log(result2);

  // Filter nested structures
  const result3 = filterEmptyValues({ data: { users: [{ name: "" }, { name: "John" }] } });
  console.log(result3);

  return { result1, result2, result3 };
}

