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
  // Elegant serif reserved for the Shop screen's hero — loaded via
  // @expo-google-fonts/playfair-display in App.tsx. Falls back silently to
  // the system font on the one frame before fonts finish loading.
  heroTitle: { fontFamily: "PlayfairDisplay_600SemiBold", fontSize: 34, letterSpacing: 0.2 },
  heroSubtitle: { fontFamily: "PlayfairDisplay_400Regular_Italic", fontSize: 15, lineHeight: 22 },
};
