import { calculateOrderTotals, calculateSubtotal } from "../src/lib/pricing";

// Pure-function unit tests — no DB needed, unlike orders.duplicate.test.ts.
describe("calculateSubtotal", () => {
  it("sums unitPrice * quantity across lines", () => {
    const subtotal = calculateSubtotal([
      { productId: "a", unitPrice: 1000, quantity: 2 }, // 2000
      { productId: "b", unitPrice: 750, quantity: 3 }, // 2250
    ]);
    expect(subtotal).toBe(4250);
  });

  it("returns 0 for an empty cart", () => {
    expect(calculateSubtotal([])).toBe(0);
  });
});

describe("calculateOrderTotals", () => {
  it("applies the flat 8% tax rate and $5 flat shipping", () => {
    const totals = calculateOrderTotals([{ productId: "a", unitPrice: 10000, quantity: 1 }]);
    expect(totals.subtotal).toBe(10000);
    expect(totals.tax).toBe(800); // 8% of 10000
    expect(totals.shipping).toBe(500);
    expect(totals.total).toBe(11300);
  });

  it("rounds tax to the nearest cent instead of leaving fractional cents", () => {
    // 8% of 999 = 79.92 — must round, never truncate or carry a float.
    const totals = calculateOrderTotals([{ productId: "a", unitPrice: 999, quantity: 1 }]);
    expect(totals.tax).toBe(80);
    expect(Number.isInteger(totals.tax)).toBe(true);
  });

  it("charges no shipping on an empty cart", () => {
    const totals = calculateOrderTotals([]);
    expect(totals).toEqual({ subtotal: 0, tax: 0, shipping: 0, total: 0 });
  });
});
