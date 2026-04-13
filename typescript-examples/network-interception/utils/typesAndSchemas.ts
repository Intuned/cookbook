import { z } from "zod";

export const paramsSchema = z.object({
  username: z.string(),
  password: z.string(),
  limit: z.number().default(5),
});

export const apiInterceptorParamsSchema = z.object({
  url: z.string(),
  api_pattern: z.string().default("/api/"),
  max_pages: z.number().default(10),
});

export const consultationSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  preferred_date: z.string(),
  preferred_time: z.string(),
  topic: z.string(),
  status: z.string(),
  user_id: z.string().optional(),
});