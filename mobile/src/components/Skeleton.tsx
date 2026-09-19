import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, ViewStyle } from "react-native";
import { colors, radii } from "../theme";

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}

/** A single pulsing placeholder block — deliberately simple, no animation library. */
export function Skeleton({ width = "100%", height = 16, radius = radii.sm, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius, backgroundColor: colors.skeleton, opacity },
        style,
      ]}
    />
  );
}

/** Grid of ProductCard-shaped skeletons for ProductListScreen's loading state. */
export function ProductGridSkeleton() {
  return (
    <View style={styles.grid}>
      {Array.from({ length: 6 }).map((_, i) => (
        <View key={i} style={styles.card}>
          <Skeleton height={140} radius={radii.md} />
          <Skeleton height={14} style={{ marginTop: 8 }} />
          <Skeleton width="60%" height={14} style={{ marginTop: 6 }} />
        </View>
      ))}
    </View>
  );
}

/**
 * Square-tile placeholders for the Home screen's "Shop by category" grid
 * (CategoryGrid) — shown for the brief first-load window before the
 * categories request resolves, so that window reads as "loading" rather
 * than as an empty/broken section.
 */
export function CategoryGridSkeleton() {
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.6, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <View style={styles.categoryGrid}>
      {Array.from({ length: 4 }).map((_, i) => (
        // A plain Animated.View, not <Skeleton> — Skeleton's own height prop
        // defaults to a fixed pixel value that would fight the
        // aspectRatio-driven square sizing needed here. Uses neutral300 (a
        // clearly visible mid-gray), not the neutral100 `colors.skeleton`
        // token the rest of the app's skeletons use — that token is nearly
        // indistinguishable from the white page background without a
        // surrounding card, which made this section look empty rather than
        // loading.
        <Animated.View key={i} style={[styles.categoryTile, { opacity }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, padding: 16 },
  card: { width: "47%" },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  categoryTile: {
    width: "48%",
    aspectRatio: 1,
    marginBottom: 12,
    borderRadius: radii.lg,
    backgroundColor: colors.neutral300,
  },
});
