import { BrowserContext, Page } from "playwright";
import { validateDataUsingSchema } from "@intuned/browser";

interface Params {
  // No params needed
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  const userData = {
    name: "John Doe",
    email: "john@example.com",
    age: 30,
  };

  const userSchema = {
    type: "object",
    required: ["name", "email", "age"],
    properties: {
      name: { type: "string", minLength: 1 },
      email: { type: "string" },
      age: { type: "number", minimum: 0 },
    },
  };

  validateDataUsingSchema({ data: userData, schema: userSchema });
  
  return "Data validated successfully";
}

