import { z } from "zod";
import { isValidLuhn } from "../lib/luhn";

export const shippingSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  addressLine1: z.string().trim().min(1, "Address is required"),
  addressLine2: z.string().trim().optional(),
  city: z.string().trim().min(1, "City is required"),
  postalCode: z.string().trim().min(1, "Postal code is required"),
  country: z.string().trim().min(1, "Country is required"),
});

export const cardSchema = z.object({
  // Only ever used client-side (Luhn check, display) — the request layer
  // slices this down to cardLast4 before it's sent anywhere.
  cardNumber: z
    .string()
    .transform((v) => v.replace(/\s+/g, ""))
    .refine((v) => /^\d{13,19}$/.test(v), "Enter a valid card number")
    .refine(isValidLuhn, "Enter a valid card number"),
  expiry: z
    .string()
    .trim()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Use MM/YY")
    .refine((v) => {
      const [mm, yy] = v.split("/").map(Number);
      // Treat the card as valid through the LAST moment of its expiry month.
      const firstDayAfterExpiry = new Date(2000 + yy, mm, 1);
      return firstDayAfterExpiry.getTime() > Date.now();
    }, "Card has expired"),
  cvv: z.string().trim().regex(/^\d{3,4}$/, "Enter a valid CVV"),
});

export const checkoutSchema = shippingSchema.merge(cardSchema);
export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
