// https://docs.intunedhq.com/automation-sdks/intuned-sdk/typescript/helpers/functions/validateDataUsingSchema
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
  const uploadData = {
    file: {
      fileName: "documents/report.pdf",
      bucket: "my-bucket",
      region: "us-east-1",
      key: "documents/report.pdf",
      endpoint: null,
      suggestedFileName: "Monthly Report.pdf",
      fileType: "document",
    },
    name: "Test File Upload",
  };

  const uploadSchema = {
    type: "object",
    required: ["file", "name"],
    properties: {
      file: { type: "attachment" },
      name: { type: "string" },
    },
  };

  validateDataUsingSchema({ data: uploadData, schema: uploadSchema });
  // Validation passes with Attachment type, it also validates Pydantic Attachment type.
  console.log("Validation passed");
  return {
    status: "valid",
    message: "Data validation passed successfully",
    validated_data: uploadData,
  };
}

