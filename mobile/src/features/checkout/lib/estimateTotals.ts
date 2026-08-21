export interface EstimatedTotals {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

// Mirrors backend/src/lib/pricing.ts exactly, for DISPLAY purposes only —
// the checkout summary shown here is an estimate so the UI doesn't sit blank
// while waiting on a round trip. The server recomputes this from scratch at
// order-creation time from current product prices, and that response (shown
// on OrderConfirmationScreen) is the only total that's ever authoritative.
const TAX_RATE = 0.08;
const FLAT_SHIPPING_CENTS = 500;

export function estimateOrderTotals(subtotal: number): EstimatedTotals {
  const tax = Math.round(subtotal * TAX_RATE);
  const shipping = subtotal === 0 ? 0 : FLAT_SHIPPING_CENTS;
  return { subtotal, tax, shipping, total: subtotal + tax + shipping };
}
