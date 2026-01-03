import { z } from "zod";

// Params schema for connect-to-cdp API
export const connectToCdpParamsSchema = z.object({
  url: z.string().url("Must be a valid URL").min(1, "URL is required"),
});

// Browser Info schema
export const browserInfoSchema = z.object({
  browserVersion: z.string(),
  protocolVersion: z.string(),
  userAgent: z.string(),
  webSocketDebuggerUrl: z.string().url(),
});

// Page Info schema
export const pageInfoSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  viewport: z.object({
    width: z.number(),
    height: z.number(),
  }),
});

// WebDriver Info schema
export const webDriverInfoSchema = z.object({
  capabilities: z.record(z.any()),
  sessionId: z.string().optional(),
});

// CDP Connection Result schema
export const cdpConnectionResultSchema = z.object({
  message: z.string(),
  cdpUrl: z.string().url(),
  browserInfo: browserInfoSchema,
  pageInfo: pageInfoSchema,
  webDriverInfo: webDriverInfoSchema,
});

// Type exports inferred from schemas
export type ConnectToCdpParams = z.infer<typeof connectToCdpParamsSchema>;
export type BrowserInfo = z.infer<typeof browserInfoSchema>;
export type PageInfo = z.infer<typeof pageInfoSchema>;
export type WebDriverInfo = z.infer<typeof webDriverInfoSchema>;
export type CDPConnectionResult = z.infer<typeof cdpConnectionResultSchema>;
