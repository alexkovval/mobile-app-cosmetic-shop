import { checkoutSchema } from "../checkoutSchemas";

function monthsFromNowExpiry(monthsOffset: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + monthsOffset);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear() % 100).padStart(2, "0");
  return `${mm}/${yy}`;
}

const validForm = {
  fullName: "Jane Doe",
  addressLine1: "123 Main St",
  addressLine2: "",
  city: "Testville",
  postalCode: "00000",
  country: "US",
  cardNumber: "4242 4242 4242 4242",
  expiry: monthsFromNowExpiry(24), // 2 years out — always in the future
  cvv: "123",
};

describe("checkoutSchema", () => {
  it("accepts a fully valid form and strips spaces from the card number", () => {
    const result = checkoutSchema.safeParse(validForm);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.cardNumber).toBe("4242424242424242");
    }
  });

  it("rejects a card number that fails the Luhn check", () => {
    const result = checkoutSchema.safeParse({ ...validForm, cardNumber: "4242 4242 4242 4241" });
    expect(result.success).toBe(false);
  });

  it("rejects an expired card", () => {
    const result = checkoutSchema.safeParse({ ...validForm, expiry: monthsFromNowExpiry(-24) });
    expect(result.success).toBe(false);
  });

  it("rejects a malformed expiry (not MM/YY)", () => {
    const result = checkoutSchema.safeParse({ ...validForm, expiry: "13/26" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing required shipping field", () => {
    const result = checkoutSchema.safeParse({ ...validForm, city: "" });
    expect(result.success).toBe(false);
  });

  it("treats addressLine2 as optional", () => {
    const { addressLine2, ...withoutLine2 } = validForm;
    const result = checkoutSchema.safeParse(withoutLine2);
    expect(result.success).toBe(true);
  });

  it("rejects a CVV that isn't 3-4 digits", () => {
    const result = checkoutSchema.safeParse({ ...validForm, cvv: "12" });
    expect(result.success).toBe(false);
  });
});
