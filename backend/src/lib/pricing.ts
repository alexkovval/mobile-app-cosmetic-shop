/**
 * Shared money math. Everything is in integer cents to avoid floating-point
 * rounding bugs — this is the single source of truth the orders module uses
 * to compute totals server-side (the client never gets to dictate a total).
 */
const TAX_RATE = 0.08; // flat 8% for MVP simplicity — a real app would look this up by shipping region
const FLAT_SHIPPING_CENTS = 500; // $5.00 flat rate; free-shipping thresholds are out of MVP scope

export interface PricedLine {
  productId: string;
  unitPrice: number; // cents
  quantity: number;
}

export interface OrderTotals {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

export function calculateSubtotal(lines: PricedLine[]): number {
  return lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
}

export function calculateOrderTotals(lines: PricedLine[]): OrderTotals {
  const subtotal = calculateSubtotal(lines);
  const tax = Math.round(subtotal * TAX_RATE);
  const shipping = lines.length === 0 ? 0 : FLAT_SHIPPING_CENTS;
  const total = subtotal + tax + shipping;
  return { subtotal, tax, shipping, total };
}
