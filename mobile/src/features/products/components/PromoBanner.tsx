import React from "react";
import { ImageBackground, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing, typography } from "../../../theme";

// Placeholder promo photo (no real campaign asset for this MVP) — a fixed
// picsum seed so it stays stable across reloads rather than changing photo
// every refresh.
const PROMO_IMAGE_URL = "https://picsum.photos/seed/cosmetics-promo-10off/900/500";

/** Shop-screen hero banner advertising the new-customer discount. */
export function PromoBanner() {
  return (
    <ImageBackground source={{ uri: PROMO_IMAGE_URL }} style={styles.container} imageStyle={styles.image}>
      <View style={styles.overlay} />
      <Text style={[typography.caption, styles.eyebrow]}>NEW HERE?</Text>
      <Text style={[typography.title, styles.headline]}>10% off your first order</Text>
      <Text style={[typography.caption, styles.subtext]}>Applied automatically at checkout for new customers.</Text>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: radii.lg,
    overflow: "hidden",
    padding: spacing.lg,
    minHeight: 140,
    justifyContent: "center",
    backgroundColor: colors.skeleton,
  },
  image: { borderRadius: radii.lg },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.overlay },
  eyebrow: { color: colors.primaryMuted, letterSpacing: 1.5, fontWeight: "700" },
  headline: { color: colors.white, marginTop: spacing.xs },
  subtext: { color: colors.white, opacity: 0.9, marginTop: spacing.xs },
});
