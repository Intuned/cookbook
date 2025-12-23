import { z } from "zod";

// ---------- Metadata ----------

const metadataSchema = z.object({
  site: z.string().url(),
  insurance_type: z.enum([
    "auto",
    "homeowners",
    "renters",
    "motorcycle",
    "boat",
    "commercial_auto",
  ]),
});

// ---------- Applicant ----------

const applicantSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  date_of_birth: z
    .string()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Date must be in MM/DD/YYYY format"),
  gender: z.enum(["male", "female", "other"]),
  marital_status: z.enum(["single", "married", "divorced", "widowed"]),
  accident_prevention_course: z.boolean().default(false),
  email: z.string().email("Invalid email address"),
  phone_number: z.string(),
  is_cell_phone: z.boolean(),
  can_text: z.boolean(),
  preferred_name: z.string().optional(),
  home_multi_policy_discount: z.boolean(),
  currently_has_auto_insurance: z.boolean(),
  coverage_effective_date: z
    .string()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Date must be in MM/DD/YYYY format"),
});

// ---------- Address ----------

const addressSchema = z.object({
  street_line1: z.string().min(1, "Street address is required"),
  street_line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().length(2, "State must be 2 characters"),
  zip_code: z.string().regex(/^\d{5}$/, "Zip code must be 5 digits"),
});

// ---------- Vehicle ----------

const vehicleSchema = z.object({
  vehicle_type: z.enum([
    "Automobile",
    "Travel Trailer",
    "ATV",
    "Utility Trailer",
    "Snowmobile",
    "Motor Home",
    "Camper",
    "Moped",
    "Trail Bike",
    "Dune Buggy",
    "Mini Bike",
    "Golf Cart",
    "Recreational Trailer",
  ]),
  year: z.number().int().positive(),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  primary_use: z
    .enum(["Farm", "Business", "Pleasure", "Work/School"])
    .optional(),
  annual_mileage: z.number().int().positive().optional(),
  days_driven_per_week: z.number().int().positive().optional(),
  miles_driven_one_way: z.number().int().positive().optional(),
});

// ---------- Root Schema ----------

export const listParametersSchema = z.object({
  metadata: metadataSchema,
  applicant: applicantSchema,
  address: addressSchema,
  vehicle: vehicleSchema,
});

export type ListParameters = z.infer<typeof listParametersSchema>;
export type Metadata = z.infer<typeof metadataSchema>;
export type Applicant = z.infer<typeof applicantSchema>;
export type Address = z.infer<typeof addressSchema>;
export type Vehicle = z.infer<typeof vehicleSchema>;
