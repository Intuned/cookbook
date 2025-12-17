import { getExecutionContext } from "@intuned/runtime";
import { randomUUID } from "crypto";

export function sanitizeKey(key: string): string {
  const chars = ["://", "/", ":", "#", "?", "&", "=", ".", "-"];
  let sanitized = key;

  for (const char of chars) {
    sanitized = sanitized.replaceAll(char, "_");
  }

  while (sanitized.includes("__")) {
    sanitized = sanitized.replace("__", "_");
  }

  return sanitized.replace(/^_+|_+$/g, "");
}

export function getJobRunId(): string {
  const runContext = getExecutionContext();
  if (!runContext || !runContext.jobRunId) {
    return `local-${randomUUID()}`;
  }
  return runContext.jobRunId;
}
