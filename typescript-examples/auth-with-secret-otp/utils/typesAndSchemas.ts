import { z } from "zod";

export const createAuthSessionParams = z.object({
  username: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
  secret: z.string().min(1, "Secret is required"),
});

export interface Contract {
  id: string;
  name: string;
  supplierName: string;
  supplierPhoneNumber: string;
  effectiveDate: string;
  expirationDate: string;
  state: string;
  detailsUrl: string;
}
