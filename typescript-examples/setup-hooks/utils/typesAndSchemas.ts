import { z } from "zod";

// Params schema for demo-hook API
export const demoHookParamsSchema = z.object({
  message: z.string().optional(),
});

// Data from hook schema
export const dataFromHookSchema = z.object({
  cdpUrl: z.string(),
  apiName: z.string(),
  apiParameters: z.any(),
  executionStartTime: z.string(),
  config: z.any(),
  userAgent: z.string(),
});

// Hook demo result schema
export const hookDemoResultSchema = z.object({
  message: z.string(),
  dataFromHook: dataFromHookSchema,
  executionTime: z.string(),
  pageTitle: z.string(),
});

// Type exports inferred from schemas
export type DemoHookParams = z.infer<typeof demoHookParamsSchema>;
export type DataFromHook = z.infer<typeof dataFromHookSchema>;
export type HookDemoResult = z.infer<typeof hookDemoResultSchema>;
