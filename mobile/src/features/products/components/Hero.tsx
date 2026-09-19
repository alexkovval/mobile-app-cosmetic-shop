import React, { useState } from "react";
import { ActivityIndicator, ImageBackground, StyleSheet, Text, View } from "react-native";
import { Button } from "../../../components/Button";
import { HERO_IMAGE } from "../../../lib/categoryImages";
import { colors, spacing } from "../../../theme";

/**
 * Full-bleed photo hero — mirrors the web edition's homepage hero
 * (cosmetics-store-web src/app/page.tsx): one tall background photo, a dark
 * overlay, and centered white title/subtitle/CTA. Replaces the old
 * plain-text title + separate small "10% off" promo banner, which had no
 * equivalent on the web homepage at all.
 */
export function Hero({ onShopNow }: { onShopNow: () => void }) {
  // The remote photo takes a moment to fetch on first paint — without this,
  // that window is just a flat gray box (skeleton bg + overlay) that reads
  // as broken rather than loading.
  const [loaded, setLoaded] = useState(false);

  return (
    <ImageBackground source={{ uri: HERO_IMAGE }} style={styles.container} onLoadEnd={() => setLoaded(true)}>
      <View style={styles.overlay} />
      {!loaded && (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.white} />
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.title}>Bloom Beauty</Text>
        <Text style={styles.subtitle}>
          Skincare, makeup, haircare &amp; fragrance — thoughtfully picked, simply priced.
        </Text>
        <Button title="Shop now" onPress={onShopNow} style={styles.cta} />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { height: 420, width: "100%", justifyContent: "center", backgroundColor: colors.skeleton },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.heroOverlay },
  loading: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  content: { alignItems: "center", paddingHorizontal: spacing.xl, gap: spacing.md },
  title: { fontSize: 40, fontWeight: "700", color: colors.white, letterSpacing: -0.5, textAlign: "center" },
  subtitle: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    maxWidth: 320,
    lineHeight: 21,
  },
  cta: { marginTop: spacing.sm, paddingHorizontal: spacing.xl },
});
