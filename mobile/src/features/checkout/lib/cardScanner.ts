import { appendLuhnCheckDigit } from "./luhn";

export interface ScannedCard {
  number: string;
  expiry: string; // MM/YY
}

/**
 * Abstraction over "get a card's number/expiry from the camera." Swapping
 * `mockCardScanner` below for a real on-device OCR/card-recognition
 * implementation is the only change a non-mocked version would need — the
 * screen and the downstream Luhn/expiry validation don't know or care which
 * one is wired in.
 */
export interface CardScanner {
  scanCard(): Promise<ScannedCard>;
}

function randomDigits(count: number): string {
  let out = "";
  for (let i = 0; i < count; i++) out += Math.floor(Math.random() * 10);
  return out;
}

function mockExpiry(): string {
  // A couple of years out, so it's always valid regardless of when this
  // demo is run.
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = (now.getFullYear() + 2) % 100;
  return `${String(month).padStart(2, "0")}/${String(year).padStart(2, "0")}`;
}

/**
 * MOCKED per the MVP's "no real payment processing" constraint
 * (ARCHITECTURE_PLAN.md §8): CardScanScreen shows a genuine live camera
 * preview for the visual "scanning" experience, but this function never
 * reads a single frame from it — it just waits a moment and resolves with a
 * synthetic, Luhn-valid card number, as if a real scan had just completed.
 */
export const mockCardScanner: CardScanner = {
  async scanCard() {
    await new Promise((resolve) => setTimeout(resolve, 1400));
    const number = appendLuhnCheckDigit("42424242424" + randomDigits(4));
    return { number, expiry: mockExpiry() };
  },
};
