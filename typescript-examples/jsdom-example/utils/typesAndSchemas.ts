import { z } from "zod";

export const listSchema = z.object({
  url: z.string().url(), // The URL to scrape (e.g.: https://www.scrapingcourse.com/ecommerce/)
  maxPages: z.number().optional(), // Maximum number of pages to scrape (default: 10)
});

export const detailsSchema = z.object({
  title: z.string(),
  price: z.string(),
  detailsUrl: z.string().url(),
});

export interface Product {
  title: string;
  price: string;
  detailsUrl: string;
}

export interface ProductDetails {
  title: string;
  price: string;
  sourceUrl: string;
  description: string;
  sku: string;
  category: string;
  sizes: string[];
  colors: string[];
  images: string[];
}
