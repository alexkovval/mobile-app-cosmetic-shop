/**
 * Standard Luhn checksum, used to validate the checkout form's card-number
 * field client-side. This is purely a demo-realism check — the actual PAN
 * never reaches the backend at all; only the last 4 digits do (see
 * backend/src/modules/orders/orders.schema.ts's `cardLast4`).
 */
export function isValidLuhn(rawDigits: string): boolean {
  const digits = rawDigits.replace(/\D/g, "");
  if (digits.length < 12) return false;

  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (shouldDouble) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

/**
 * Appends whichever digit 0-9 makes `partial` pass isValidLuhn. Used only by
 * the mock card scanner to produce a number that looks/validates like a real
 * card without it actually being one.
 */
export function appendLuhnCheckDigit(partial: string): string {
  for (let d = 0; d <= 9; d++) {
    const candidate = partial + d;
    if (isValidLuhn(candidate)) return candidate;
  }
  /* istanbul ignore next -- one of 0-9 always satisfies mod 10 */
  return partial + "0";
}
