import { TextStyle } from "react-native";

type TypeScale = Record<
  | "displaySmall"
  | "title"
  | "subtitle"
  | "body"
  | "bodyMedium"
  | "caption"
  | "button"
  | "heroTitle"
  | "heroSubtitle",
  TextStyle
>;

// Plain system font throughout — matches the web edition, which uses no
// custom typeface either. The old heroTitle/heroSubtitle used a loaded
// serif (Playfair Display) for the Home screen wordmark; that's gone along
// with the rest of the warm/pink beauty branding (see theme/colors.ts), so
// there's nothing left to load a custom font for.
export const typography: TypeScale = {
  displaySmall: { fontSize: 26, fontWeight: "700", letterSpacing: -0.3 },
  title: { fontSize: 20, fontWeight: "700" },
  subtitle: { fontSize: 16, fontWeight: "600" },
  body: { fontSize: 15, fontWeight: "400" },
  bodyMedium: { fontSize: 15, fontWeight: "500" },
  // Explicit lineHeight (not just fontSize) so short pill-shaped containers
  // like Chip give the glyphs enough vertical room — without it, some
  // bold/condensed system fonts render with ascenders clipped by a tight
  // default line box inside small fixed-padding containers.
  caption: { fontSize: 13, fontWeight: "400", lineHeight: 18 },
  button: { fontSize: 15, fontWeight: "600" },
  heroTitle: { fontSize: 28, fontWeight: "700", letterSpacing: -0.3 },
  heroSubtitle: { fontSize: 15, fontWeight: "400", lineHeight: 21 },
};
