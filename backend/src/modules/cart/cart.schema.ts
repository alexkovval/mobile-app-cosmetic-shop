import { z } from "zod";

export const addCartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).default(1),
});
export type AddCartItemInput = z.infer<typeof addCartItemSchema>;

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(1),
});
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;

export const cartItemIdParamsSchema = z.object({
  id: z.string().min(1),
});
