import { z } from "zod";

export const bookConsultationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  topic: z.enum(
    [
      "web-scraping",
      "data-extraction",
      "automation",
      "api-integration",
      "other",
    ],
    {
      errorMap: () => ({ message: "Valid topic is required" }),
    }
  ),
});

export const getConsultationsByEmailSchema = z.object({
  email: z.string().email("Valid email is required"),
});

export interface Consultation {
  id: string;
  status: string;
  clientName: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  topic: string;
}

export const createAuthSessionParams = z.object({
  username: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
  secret: z.string().min(1, "Secret is required"),
});
