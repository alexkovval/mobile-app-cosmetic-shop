/**
 * Neutral, monochrome palette matching the web edition (cosmetics-store-web
 * / Bloom Beauty) — Tailwind's default `neutral` scale plus a single red
 * accent for errors/out-of-stock, no warm/pink "beauty brand" colors. Kept
 * in one place so every screen references `colors.*` instead of hardcoding
 * hex values, so this one file is what re-skins the whole app.
 */
const neutral50 = "#FAFAFA";
const neutral100 = "#F5F5F5";
const neutral200 = "#E5E5E5";
const neutral300 = "#D4D4D4";
const neutral500 = "#737373";
const neutral700 = "#404040";
const neutral900 = "#171717";

export const colors = {
  background: "#FFFFFF",
  surface: "#FFFFFF",
  // Light-gray fill for the "secondary" button and other muted surfaces —
  // mirrors the web Button's `bg-neutral-100` variant.
  surfaceMuted: neutral100,
  primary: neutral900,
  primaryMuted: neutral200,
  text: neutral900,
  textMuted: neutral500,
  // No more serif/rose hero styling — the Home screen title now reads as
  // plain bold black text, same weight/contrast as the web Shop page's <h1>.
  heroTitle: neutral900,
  heroSubtitle: neutral500,
  border: neutral200,
  // The web app has no green/amber accent anywhere, so order-status colors
  // stay in the same monochrome family, only differing in weight/tint —
  // still readable as distinct states without reintroducing brand color.
  success: neutral700,
  successMuted: neutral100,
  error: "#DC2626",
  errorMuted: "#FEE2E2",
  warning: neutral700,
  warningMuted: neutral200,
  skeleton: neutral100,
  overlay: "rgba(23, 23, 23, 0.6)",
  // Dedicated overlays for the Home screen's photo hero / category tiles —
  // matches the web homepage's `bg-black/40` (hero) and `bg-black/25`
  // (category tile) exactly, rather than reusing the slightly different
  // `overlay` token above (which some other badges already depend on).
  heroOverlay: "rgba(0, 0, 0, 0.4)",
  tileOverlay: "rgba(0, 0, 0, 0.28)",
  white: "#FFFFFF",
  black: "#000000",
  neutral50,
  neutral300,
};
