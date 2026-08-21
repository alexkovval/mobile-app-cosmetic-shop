/**
 * Small, warm palette for a cosmetics/beauty storefront. Kept in one place
 * so every screen references `colors.*` instead of hardcoding hex values.
 */
export const colors = {
  background: "#FDF6F3",
  surface: "#FFFFFF",
  primary: "#C9184A",
  primaryMuted: "#F7D6DF",
  text: "#2B2320",
  textMuted: "#8A7E79",
  // Softer, dustier tones reserved for the Shop hero (title/description) —
  // deliberately lower-contrast than `text`/`textMuted`, so keep those for
  // anything that needs strong body-text legibility.
  heroTitle: "#9C4F63",
  heroSubtitle: "#B08A82",
  border: "#EDE3DF",
  success: "#2E7D32",
  successMuted: "#E3F2E3",
  error: "#B3261E",
  errorMuted: "#FCE8E6",
  warning: "#8A6D00",
  warningMuted: "#FFF6D9",
  skeleton: "#EDE3DF",
  overlay: "rgba(43, 35, 32, 0.55)",
  white: "#FFFFFF",
  black: "#000000",
};
