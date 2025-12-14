import { z } from "zod";

export const listSchema = z.object({
  url: z.string(),
  api_pattern: z.string().optional(),
  max_pages: z.number().optional(),
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
