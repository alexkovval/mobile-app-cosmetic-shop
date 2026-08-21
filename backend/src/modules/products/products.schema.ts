import { z } from "zod";

export const listProductsQuerySchema = z.object({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;

export const productIdParamsSchema = z.object({
  id: z.string().min(1),
});
