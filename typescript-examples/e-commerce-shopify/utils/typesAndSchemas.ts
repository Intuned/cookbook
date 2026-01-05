import { z } from "zod";

export const shopifyListSchema = z.object({
  store_url: z.string().url("Valid Shopify store URL is required"),
  maxPages: z.number().int().positive().optional(),
});

export const shopifyDetailsSchema = z.object({
  name: z.string(),
  vendor: z.string(),
  product_type: z.string(),
  tags: z.array(z.string()),
  details_url: z.string().url("Valid product details URL is required"),
});

export interface Product {
  name: string;
  vendor: string;
  product_type: string;
  tags: string[];
  details_url: string;
}

export interface ProductVariant {
  sku: string;
  title: string;
  price: string;
  compare_at_price: string | null;
  available: boolean;
  inventory_quantity: number;
}

export interface ProductDetails {
  source_url: string;
  id: number;
  name: string;
  handle: string;
  vendor: string;
  product_type: string;
  tags: string[];
  description: string;
  price: string;
  images: string[];
  options: any[];
  variants: ProductVariant[];
}

