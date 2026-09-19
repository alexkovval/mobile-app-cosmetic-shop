import React from "react";
import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { CATEGORY_IMAGE } from "../../../lib/categoryImages";
import { colors, radii, spacing, typography } from "../../../theme";

interface CategoryGridProps {
  categories: string[];
  onSelect: (category: string) => void;
}

/**
 * "Shop by category" tile grid — mirrors the web homepage's category grid
 * (cosmetics-store-web src/app/page.tsx): a 2-column grid of photo tiles
 * with a dark overlay and the category name bottom-left, each tapping
 * through to a pre-filtered product list.
 */
export function CategoryGrid({ categories, onSelect }: CategoryGridProps) {
  // Explicit square size instead of `width: "48%"` + aspectRatio — that
  // combo collapsed to zero height inside this wrapping row, so the tiles
  // never appeared.
  const { width } = useWindowDimensions();
  const tileSize = (width - spacing.lg * 2 - spacing.md) / 2;

  return (
    <View style={styles.grid}>
      {categories.map((category) => (
        <Pressable
          key={category}
          style={({ pressed }) => [styles.tile, { width: tileSize, height: tileSize }, pressed && styles.pressed]}
          onPress={() => onSelect(category)}
        >
          <Image source={{ uri: CATEGORY_IMAGE[category] }} style={styles.image} resizeMode="cover" />
          <View style={styles.overlay} />
          <Text style={[typography.bodyMedium, styles.label]}>{category}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
  },
  tile: {
    borderRadius: radii.lg,
    overflow: "hidden",
    marginBottom: spacing.md,
    backgroundColor: colors.skeleton,
  },
  pressed: { opacity: 0.9 },
  image: { ...StyleSheet.absoluteFillObject },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.tileOverlay },
  label: { position: "absolute", left: spacing.sm, bottom: spacing.sm, color: colors.white, fontWeight: "600" },
});
