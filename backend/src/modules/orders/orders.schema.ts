import { z } from "zod";

export const shippingInfoSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  addressLine1: z.string().trim().min(1, "Address is required"),
  addressLine2: z.string().trim().optional(),
  city: z.string().trim().min(1, "City is required"),
  postalCode: z.string().trim().min(1, "Postal code is required"),
  country: z.string().trim().min(1, "Country is required"),
});

export const createOrderSchema = z.object({
  shippingInfo: shippingInfoSchema,
  // Only a masked last-4 ever reaches the server — no PAN, no CVV, no expiry.
  // This is enforced at the type level, not just by convention: the field is
  // literally typed to accept nothing but 4 digits.
  cardLast4: z.string().regex(/^\d{4}$/, "cardLast4 must be exactly 4 digits"),
});
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const idempotencyKeyHeaderSchema = z
  .string({ required_error: "Idempotency-Key header is required" })
  .uuid("Idempotency-Key must be a valid UUID");
