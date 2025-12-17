import { z } from "zod";

export const createAuthSessionParams = z.object({
  username: z.string().email("Valid email is required"),
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

export const createEmailOTPSessionParams = z.object({
  email: z.string().email(),
});
