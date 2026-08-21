import { appendLuhnCheckDigit, isValidLuhn } from "../luhn";

describe("isValidLuhn", () => {
  it("accepts well-known valid test card numbers", () => {
    expect(isValidLuhn("4242424242424242")).toBe(true); // Stripe/Visa test number
    expect(isValidLuhn("4111111111111111")).toBe(true); // common Visa test number
  });

  it("rejects a number with one digit changed", () => {
    expect(isValidLuhn("4242424242424241")).toBe(false);
  });

  it("rejects non-digit input and numbers that are too short", () => {
    expect(isValidLuhn("not-a-card")).toBe(false);
    expect(isValidLuhn("4242")).toBe(false);
  });

  it("ignores spaces, since the schema strips them before validating", () => {
    expect(isValidLuhn("4242 4242 4242 4242".replace(/\s+/g, ""))).toBe(true);
  });
});

describe("appendLuhnCheckDigit", () => {
  it("produces a number that itself passes isValidLuhn", () => {
    const full = appendLuhnCheckDigit("424242424242424");
    expect(full).toHaveLength(16);
    expect(isValidLuhn(full)).toBe(true);
  });

  it("is what the mock card scanner relies on to produce a plausible number", () => {
    const full = appendLuhnCheckDigit("42424242424" + "1234");
    expect(isValidLuhn(full)).toBe(true);
  });
});
