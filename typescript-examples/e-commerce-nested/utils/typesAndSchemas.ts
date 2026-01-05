import { z } from "zod";

export const categorySchema = z.object({
  store_url: z.string().url("Valid store URL is required"),
});

export const listSchema = z.object({
  category_name: z.string(),
  category_url: z.string().url("Valid category URL is required"),
});

export const detailsSchema = z.object({
  name: z.string(),
  price: z.string(),
  details_url: z.string().url("Valid product details URL is required"),
});

export interface Category {
  category_name: string;
  category_url: string;
}

export interface Product {
  name: string;
  price: string;
  details_url: string;
}

export interface Size {
  size: string;
  is_available: boolean;
}

export interface ProductDetails {
  source_url: string;
  name: string;
  price: string | null;
  sale_price: string | null;
  sale_offer: string | null;
  sizes: Size[];
  description: string | null;
  shipping_and_returns: string | null;
}
