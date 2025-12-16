import { z } from "zod";

export const insureeSchema = z.object({
  chfId: z.string(),
  lastName: z.string(),
  otherNames: z.string(),
  dob: z.string(),
});

export const insureeNodeSchema = z.object({
  node: insureeSchema,
});

export const insureeEdgesSchema = z.object({
  edges: z.array(insureeNodeSchema),
});

export const insureeDataSchema = z.object({
  insurees: insureeEdgesSchema,
});

export const insureeResponseSchema = z.object({
  data: insureeDataSchema,
});

export type InsureeResponse = z.infer<typeof insureeResponseSchema>;

export const paramsSchema = z.object({
  url: z.string(),
  api_url: z.string(),
  query: z.string().optional(),
  username: z.string(),
  password: z.string(),
  login_url: z.string().optional(),
});
