import { z } from "zod";
import { Attachment } from "@intuned/browser";

export const listSchema = z.object({
  limit: z.number().optional(),
});

export const detailsSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  detailsUrl: z.string().url("Valid product URL is required"),
});

export type DetailsInputSchema = z.infer<typeof detailsSchema>;
export type ListInputSchema = z.infer<typeof listSchema>;

export interface ProductVariant {
  sku: string;
  size: string;
  color: string;
  availability: string;
  stock: number;
}

export interface ProductDetails {
  name: string;
  detailsUrl: string;
  price: string;
  id: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  availableSizes: string[];
  availableColors: string[];
  variants: ProductVariant[];
  imageAttachments: Attachment[];
}
