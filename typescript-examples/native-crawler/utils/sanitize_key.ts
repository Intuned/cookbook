
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
